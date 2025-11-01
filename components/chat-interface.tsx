"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  CheckIcon,
  CopyIcon,
  MessageSquareIcon,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Action, Actions } from "./ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./ai-elements/conversation";
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationSource,
} from "./ai-elements/inline-citation";
import { Message, MessageContent } from "./ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "./ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "./ai-elements/reasoning";
import { Response } from "./ai-elements/response";
import { useTheme } from "next-themes";
import { getGreeting } from "@/utils/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: any[];
  userName?: string;
}

export default function ChatInterface({
  chatId,
  initialMessages = [],
  userName = "User",
}: ChatInterfaceProps = {}) {
  const router = useRouter();
  const params = useParams();
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const { theme } = useTheme();
  const hasNavigated = useRef(false);
  const greeting = getGreeting();

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({
        chatId: currentChatId || null,
      }),
    }),
    onFinish: ({ message }) => {
      // Extract chat ID from message metadata (sent by server on first message)
      if (message.metadata && typeof message.metadata === "object") {
        const metadata = message.metadata as any;
        if (metadata.chatId && !currentChatId && !hasNavigated.current) {
          hasNavigated.current = true;
          setCurrentChatId(metadata.chatId);
          // Navigate to the new chat URL
          router.push(`/chat/${metadata.chatId}`);
        }
      }

      // Refresh sidebar to show updated chat list
      router.refresh();
    },
  });

  // Initialize messages from server on mount (for existing chats)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }

    if (!params.id) {
      return;
    }
  }, [initialMessages, setMessages, params]);

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 ? (
        /* Empty State - Centered Layout */
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="w-full max-w-3xl space-y-8">
            {/* Greeting */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight">
                {greeting}, {userName?.split(" ")[0]}
              </h1>
              <p className="text-muted-foreground">How can I help you today?</p>
            </div>

            {/* Centered Prompt Input */}
            <PromptInput
              onSubmit={async (message, event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const text = (message.text ?? "").trim();
                if (!text && !(message.files && message.files.length > 0))
                  return;

                try {
                  let uploadedFiles = message.files;
                  if (message.files && message.files.length > 0) {
                    setIsUploading(true);

                    uploadedFiles = await Promise.all(
                      message.files.map(async (file) => {
                        const response = await fetch(file.url);
                        const blob = await response.blob();

                        const formData = new FormData();
                        const filename = file.filename || `file-${Date.now()}`;
                        formData.append("file", blob, filename);

                        const uploadResponse = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        });

                        if (!uploadResponse.ok) {
                          const error = await uploadResponse.json();
                          throw new Error(
                            error.error || "Failed to upload file"
                          );
                        }

                        const uploadedFile = await uploadResponse.json();

                        return {
                          type: "file" as const,
                          url: uploadedFile.url,
                          filename: uploadedFile.filename,
                          mediaType: uploadedFile.mimeType,
                          size: uploadedFile.size,
                        };
                      })
                    );

                    setIsUploading(false);
                  }

                  sendMessage({
                    text,
                    files: uploadedFiles,
                  });

                  if (form) {
                    form.reset();
                  }
                } catch (error) {
                  setIsUploading(false);
                  console.error("Upload error:", error);
                  alert(
                    error instanceof Error
                      ? error.message
                      : "Failed to upload file"
                  );
                }
              }}
              globalDrop
              multiple
            >
              <PromptInputBody>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea placeholder="Ask anything..." />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                </PromptInputTools>
                <PromptInputSubmit
                  className="h-8!"
                  status={isUploading ? "submitted" : status}
                  disabled={isUploading}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      ) : (
        /* Messages View */
        <>
          {/* Messages Area - Scrollable container */}
          <Conversation className="flex-1">
            <ConversationContent>
              <div className="max-w-3xl 2xl:max-w-4xl mx-auto">
                <>
                  {messages.map((message, index) => (
                    <div key={message.id}>
                      {/* Show reasoning when streaming */}
                      {message.role === "assistant" &&
                        index === messages.length - 1 &&
                        (status === "submitted" || status === "streaming") && (
                          <Reasoning className="w-full mb-3" isStreaming={true}>
                            <ReasoningTrigger />
                            <ReasoningContent>
                              Analyzing your question and preparing response...
                            </ReasoningContent>
                          </Reasoning>
                        )}

                      {/* Message content */}
                      <Message from={message.role}>
                        <MessageContent
                          className={
                            message.role == "user" ? "max-w-md" : "max-w-full"
                          }
                        >
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case "file":
                                if (part.mediaType?.startsWith("image/")) {
                                  return (
                                    <div
                                      key={`${message.id}-${i}`}
                                      className="mb-2"
                                    >
                                      <img
                                        src={part.url}
                                        alt={part.filename ?? `attachment-${i}`}
                                        width={500}
                                        height={500}
                                        className="rounded-lg"
                                      />
                                    </div>
                                  );
                                }
                                if (
                                  part.mediaType?.startsWith("application/pdf")
                                ) {
                                  return (
                                    <div
                                      key={`${message.id}-${i}`}
                                      className="mb-2"
                                    >
                                      <iframe
                                        src={part.url}
                                        width="100%"
                                        height="600"
                                        title={
                                          part.filename ?? `attachment-${i}`
                                        }
                                        className="rounded-lg border"
                                      />
                                    </div>
                                  );
                                }
                                return null;
                              case "text":
                                return (
                                  <Response key={`${message.id}-${i}`}>
                                    {part.text}
                                  </Response>
                                );
                              case "tool-google_search":
                                return (
                                  <Reasoning
                                    key={`${message.id}-${i}`}
                                    className="w-full mb-3"
                                    isStreaming={
                                      status === "streaming" &&
                                      i === message.parts.length - 1 &&
                                      message.id === messages.at(-1)?.id
                                    }
                                  >
                                    <ReasoningTrigger />
                                    <ReasoningContent>
                                      Searching the web for current
                                      information...
                                    </ReasoningContent>
                                  </Reasoning>
                                );
                              case "source-url":
                                return null;
                              default:
                                return null;
                            }
                          })}
                        </MessageContent>
                      </Message>

                      {/* Display sources for assistant messages with Google Search */}
                      {message.role === "assistant" &&
                        message.parts.some(
                          (part) => part.type === "source-url"
                        ) && (
                          <div className="ml-4 -mt-5 mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">Sources:</span>
                            {message.parts
                              .filter((part) => part.type === "source-url")
                              .map((part: any, i) => (
                                <InlineCitation
                                  key={`${message.id}-source-${i}`}
                                >
                                  <InlineCitationCard>
                                    <InlineCitationCardTrigger
                                      sources={[part.title || part.url]}
                                      url={part.url}
                                    />
                                    <InlineCitationCardBody>
                                      <InlineCitationCarousel>
                                        <InlineCitationCarouselContent>
                                          <InlineCitationCarouselItem>
                                            <InlineCitationSource
                                              title={part.title}
                                              url={part.url}
                                              description="Source from Google Search"
                                              onClick={() =>
                                                window.open(
                                                  part.url,
                                                  "_blank",
                                                  "noopener,noreferrer"
                                                )
                                              }
                                              className="cursor-pointer hover:bg-accent transition-colors"
                                            />
                                          </InlineCitationCarouselItem>
                                        </InlineCitationCarouselContent>
                                      </InlineCitationCarousel>
                                    </InlineCitationCardBody>
                                  </InlineCitationCard>
                                </InlineCitation>
                              ))}
                          </div>
                        )}

                      {message.role === "assistant" && status === "ready" && (
                        <Actions className="ml-2 -mt-5">
                          <Action
                            tooltip="Copy"
                            onClick={() => {
                              if (
                                message.parts.some(
                                  (part) => part.type === "text"
                                )
                              ) {
                                navigator.clipboard.writeText(
                                  message.parts.find(
                                    (part) => part.type === "text"
                                  )?.text ?? ""
                                );
                                setCopiedMessageId(message.id);

                                setTimeout(() => {
                                  setCopiedMessageId(null);
                                }, 2000);
                              }
                            }}
                            label="Copy"
                          >
                            {copiedMessageId === message.id ? (
                              <CheckIcon className="size-4" />
                            ) : (
                              <CopyIcon className="size-4" />
                            )}
                          </Action>
                          {isLiked === null ? (
                            <>
                              <Action onClick={() => setIsLiked(true)}>
                                <ThumbsUp className="size-4" />
                              </Action>
                              <Action onClick={() => setIsLiked(false)}>
                                <ThumbsDown className="size-4" />
                              </Action>
                            </>
                          ) : (
                            <Action onClick={() => setIsLiked(null)}>
                              {isLiked ? (
                                <ThumbsUp
                                  fill={theme === "dark" ? "white" : "black"}
                                  className="size-4"
                                />
                              ) : (
                                <ThumbsDown
                                  fill={theme === "dark" ? "white" : "black"}
                                  className="size-4"
                                />
                              )}
                            </Action>
                          )}
                        </Actions>
                      )}
                    </div>
                  ))}
                </>
              </div>
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input Area */}
          <div className="border-t bg-background">
            <div className="mx-auto max-w-3xl px-4 py-4">
              <PromptInput
                onSubmit={async (message, event) => {
                  event.preventDefault();

                  // Store form reference before async operations
                  const form = event.currentTarget;

                  const text = (message.text ?? "").trim();
                  if (!text && !(message.files && message.files.length > 0))
                    return;

                  try {
                    // Upload files to Vercel Blob if any
                    let uploadedFiles = message.files;
                    if (message.files && message.files.length > 0) {
                      setIsUploading(true);

                      uploadedFiles = await Promise.all(
                        message.files.map(async (file) => {
                          // Convert data URL to Blob
                          const response = await fetch(file.url);
                          const blob = await response.blob();

                          // Create FormData with proper filename
                          const formData = new FormData();
                          const filename =
                            file.filename || `file-${Date.now()}`;
                          formData.append("file", blob, filename);

                          // Upload to Vercel Blob
                          const uploadResponse = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });

                          if (!uploadResponse.ok) {
                            const error = await uploadResponse.json();
                            throw new Error(
                              error.error || "Failed to upload file"
                            );
                          }

                          const uploadedFile = await uploadResponse.json();

                          // Return file with Vercel Blob URL
                          return {
                            type: "file" as const,
                            url: uploadedFile.url,
                            filename: uploadedFile.filename,
                            mediaType: uploadedFile.mimeType,
                            size: uploadedFile.size,
                          };
                        })
                      );

                      setIsUploading(false);
                    }

                    sendMessage({
                      text,
                      files: uploadedFiles,
                    });

                    if (form) {
                      form.reset();
                    }
                  } catch (error) {
                    setIsUploading(false);
                    console.error("Upload error:", error);
                    alert(
                      error instanceof Error
                        ? error.message
                        : "Failed to upload file"
                    );
                  }
                }}
                className="mt-4"
                globalDrop
                multiple
              >
                <PromptInputBody>
                  <PromptInputAttachments>
                    {(attachment) => (
                      <PromptInputAttachment data={attachment} />
                    )}
                  </PromptInputAttachments>
                  <PromptInputTextarea placeholder="Ask anything..." />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger />
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                    {/* <PromptInputSpeechButton
                  onTranscriptionChange={setText}
                  textareaRef={textareaRef}
                /> */}
                  </PromptInputTools>
                  <PromptInputSubmit
                    className="h-8!"
                    status={isUploading ? "submitted" : status}
                    disabled={isUploading}
                  />
                </PromptInputFooter>
              </PromptInput>
              <p className="mt-2 text-xs text-center text-muted-foreground">
                ChatGPT can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
