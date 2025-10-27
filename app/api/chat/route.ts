import { convertToModelMessages, streamText, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

export const maxDuration = 30;

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
    }: { messages: UIMessage[]; chatId: string } = await req.json();

    // Handle new chat creation
    let currentChatId = chatId;
    // if user currently in new chat, create a new chat
    if (!currentChatId && uiMessages.length > 0) {
      // Generate chat title
      const firstMessage = uiMessages[0];
      const title = firstMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ")
        .slice(0, 100);

      const [newChat] = await db
        .insert(chats)
        .values({
          userId: session.user.id,
          title,
        })
        .returning();

      currentChatId = newChat.id;
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
      onFinish: async ({ text }) => {
        await db.insert(messages).values({
          chatId: currentChatId,
          role: "assistant",
          content: text,
        });
      },
    });

    const response = result.toUIMessageStreamResponse({
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
