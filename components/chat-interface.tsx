"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { GlobeIcon, MessageSquareIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./ai-elements/conversation";
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
  PromptInputButton,
  PromptInputFooter,
  // type PromptInputMessage,
  // PromptInputModelSelect,
  // PromptInputModelSelectContent,
  // PromptInputModelSelectItem,
  // PromptInputModelSelectTrigger,
  // PromptInputModelSelectValue,
  // PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "./ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./ai-elements/tool";
import { Response } from "./ai-elements/response";
import { Shimmer } from "./ai-elements/shimmer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: any[];
}

export default function ChatInterface({
  chatId,
  initialMessages = [],
}: ChatInterfaceProps = {}) {
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const hasNavigated = useRef(false);

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
  }, [initialMessages, setMessages]);

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area - Scrollable container */}
      <div className="flex-1 overflow-y-auto">
        <Conversation
          className="relative size-full max-w-3xl 2xl:max-w-4xl mx-auto overflow-visible"
          style={{ height: "auto" }}
        >
          <ConversationContent className="overflow-visible">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquareIcon className="size-6" />}
                title="Start a conversation"
                description="Messages will appear here as the conversation progresses."
              />
            ) : (
              <>
                {(status === "submitted" || status === "streaming") && (
                  <Message from="assistant">
                    <MessageContent>
                      <div className="flex items-center gap-2">
                        <Shimmer duration={1}>Thinking...</Shimmer>
                      </div>
                    </MessageContent>
                  </Message>
                )}
                {messages.map((message, index) => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent
                      className={message.role == "user" ? "max-w-md" : ""}
                    >
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          case "tool-getWeather":
                            return (
                              <Tool>
                                <ToolHeader
                                  type={part.type}
                                  state={part.state}
                                />
                                <ToolContent>
                                  <ToolInput input={part.input} />
                                  <ToolOutput
                                    errorText={part.errorText}
                                    output={part.output}
                                  />
                                </ToolContent>
                              </Tool>
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <PromptInput
            onSubmit={(message, event) => {
              event.preventDefault();
              const text = (message.text ?? "").trim();
              if (!text && !(message.files && message.files.length > 0)) return;
              sendMessage({
                text,
                files: message.files,
              });
              event.currentTarget.reset();
            }}
            className="mt-4"
            globalDrop
            multiple
          >
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea placeholder="Type a message..." />
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
                <PromptInputButton>
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                {/* <PromptInputModelSelect onValueChange={setModel} value={model}>
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((modelOption) => (
                      <PromptInputModelSelectItem
                        key={modelOption.id}
                        value={modelOption.id}
                      >
                        {modelOption.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect> */}
              </PromptInputTools>
              <PromptInputSubmit className="h-8!" status={status} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
