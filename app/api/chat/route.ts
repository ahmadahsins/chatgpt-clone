import { generateChatTitleAsync } from "@/lib/ai-sdk/title-generator";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { eq } from "drizzle-orm";

export const maxDuration = 30;

const tools = {
  // Google Search - Built-in grounding tool
  google_search: google.tools.googleSearch({}),
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  if (!session?.user?.id) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const {
      messages: uiMessages,
      chatId,
    }: {
      messages: UIMessage[];
      chatId: string;
    } = await req.json();

    // Handle new chat creation
    let currentChatId = chatId;
    // if user currently in new chat, create a new chat
    if (!currentChatId && uiMessages.length > 0) {
      // Generate chat title
      const firstMessage = uiMessages[0];
      const userPrompt = firstMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ");

      // Use fallback title initially (instant chat creation)
      const fallbackTitle = userPrompt.slice(0, 100);

      const [newChat] = await db
        .insert(chats)
        .values({
          userId: session.user.id,
          title: fallbackTitle,
        })
        .returning();

      currentChatId = newChat.id;

      // Generate AI title asynchronously (non-blocking)
      generateChatTitleAsync(
        userPrompt,
        async (generatedTitle) => {
          // Update title in background
          await db
            .update(chats)
            .set({ title: generatedTitle })
            .where(eq(chats.id, currentChatId));
        },
        { maxRetries: 2, timeout: 8000 }
      );
    }

    const lastMessage = uiMessages[uiMessages.length - 1];
    if (lastMessage.role === "user") {
      await db.insert(messages).values({
        chatId: currentChatId,
        role: "user",
        content: lastMessage.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n"),
      });
    }

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        ...convertToModelMessages(uiMessages),
      ],
      tools,
      stopWhen: stepCountIs(2),
      onFinish: async ({ text }) => {
        await db.insert(messages).values({
          chatId: currentChatId,
          role: "assistant",
          content: text,
        });
      },
    });

    const response = result.toUIMessageStreamResponse({
      sendSources: true, // ✅ Enable sources from Google Search
      messageMetadata: ({ part }) => {
        // Send chat ID as metadata when streaming starts
        if (part.type === "start") {
          return {
            chatId: currentChatId,
          };
        }
      },
    });

    // Also set header for backward compatibility
    response.headers.set("X-Chat-ID", currentChatId);
    return response;
  } catch (error) {
    console.error(error);
    return new Response("Failed to stream chat response", {
      status: 500,
    });
  }
}
