import { convertToModelMessages, streamText, UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        ...convertToModelMessages(messages),
      ],
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Failed to stream chat response", {
      status: 500,
    });
  }
}
