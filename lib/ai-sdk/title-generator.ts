import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Generate chat title with retry and fallback logic
 */
export async function generateChatTitle(
  userPrompt: string,
  options?: {
    maxRetries?: number;
    timeout?: number;
  }
): Promise<string> {
  const { maxRetries = 2, timeout = 8000 } = options || {};
  const fallbackTitle = userPrompt.slice(0, 100);

  try {
    const { text: generatedTitle } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Generate a short, descriptive title (max 6 words) for a chat that starts with this message: "${userPrompt}". Only return the title, nothing else and make sure the title using language based on language used in the message!`,
      maxRetries,
      abortSignal: AbortSignal.timeout(timeout),
    });

    if (generatedTitle?.trim() && generatedTitle.trim() !== fallbackTitle) {
      return generatedTitle.trim();
    }

    return fallbackTitle;
  } catch (error: any) {
    console.error("[Title Generation] Failed:", error?.message);
    return fallbackTitle;
  }
}

/**
 * Generate chat title asynchronously without blocking
 */
export function generateChatTitleAsync(
  userPrompt: string,
  onSuccess: (title: string) => void | Promise<void>,
  options?: {
    maxRetries?: number;
    timeout?: number;
  }
): void {
  generateChatTitle(userPrompt, options)
    .then((title) => {
      const fallbackTitle = userPrompt.slice(0, 100);
      if (title !== fallbackTitle) {
        return onSuccess(title);
      }
    })
    .catch((err) => {
      console.error("[Title Generation Async] Failed:", err?.message);
    });
}
