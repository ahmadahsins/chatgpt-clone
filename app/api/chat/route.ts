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
      // Extract attachments from message
      const attachments: Array<{
        type: "image" | "pdf";
        url: string;
        filename: string;
        size: number;
        mimeType: string;
      }> =
        lastMessage.parts
          ?.filter((part: any) => part.type === "file")
          .map((part: any) => ({
            type: (part.mediaType?.startsWith("image/") ? "image" : "pdf") as
              | "image"
              | "pdf",
            url: part.url as string,
            filename: (part.filename || "attachment") as string,
            size: (part.size || 0) as number,
            mimeType: (part.mediaType || "") as string,
          })) || [];

      await db.insert(messages).values({
        chatId: currentChatId,
        role: "user",
        content: lastMessage.parts
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("\n"),
        attachments: attachments.length > 0 ? attachments : null,
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
      onFinish: async ({ text, response, steps }) => {
        // Extract sources from Google Search grounding metadata
        let sources: { url: string; title?: string }[] = [];

        // Extract from Gemini grounding metadata
        if (steps && steps.length > 0) {
          steps.forEach((step: any) => {
            const groundingMetadata =
              step.providerMetadata?.google?.groundingMetadata;

            if (
              groundingMetadata?.groundingSupports &&
              groundingMetadata?.groundingChunks
            ) {
              groundingMetadata.groundingSupports.forEach((support: any) => {
                if (
                  support.groundingChunkIndices &&
                  support.groundingChunkIndices.length > 0
                ) {
                  const chunkIndex = support.groundingChunkIndices[0];
                  const chunk = groundingMetadata.groundingChunks[chunkIndex];

                  if (chunk?.web?.uri) {
                    const source = {
                      url: chunk.web.uri,
                      title: chunk.web.title || new URL(chunk.web.uri).hostname,
                    };

                    // Avoid duplicates
                    if (!sources.some((s) => s.url === source.url)) {
                      sources.push(source);
                    }
                  }
                }
              });
            }
          });
        }

        // Fallback: Extract from response.messages (for other models)
        if (sources.length === 0 && response?.messages) {
          sources = response.messages
            .flatMap((msg: any) => {
              if (typeof msg.content === "string") return [];
              const contentArray = Array.isArray(msg.content)
                ? msg.content
                : [msg.content];
              return contentArray;
            })
            .filter((part: any) => part && part.type === "source-url")
            .map((part: any) => ({
              url: part.url,
              title: part.url ? new URL(part.url).hostname : undefined,
            }));
        }

        // Save message with sources to database
        await db.insert(messages).values({
          chatId: currentChatId,
          role: "assistant",
          content: text,
          sources: sources.length > 0 ? sources : null,
        });
      },
    });

    const response = result.toUIMessageStreamResponse({
      sendSources: true, // Enable sources from Google Search
      messageMetadata: ({ part }) => {
        // Send chat ID as metadata when streaming starts
        if (part.type === "start") {
          return {
            chatId: currentChatId,
          };
        }
      },
    });

    // set header for backward compatibility
    response.headers.set("X-Chat-ID", currentChatId);
    return response;
  } catch (error) {
    console.error(error);
    return new Response("Failed to stream chat response", {
      status: 500,
    });
  }
}
