"use client";

import { GlobeIcon, MessageSquareIcon, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./ai-elements/conversation";
import { Message, MessageAvatar, MessageContent } from "./ai-elements/message";
import { Response } from "./ai-elements/response";
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
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "./ai-elements/prompt-input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const { messages, sendMessage, status } = useChat();

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <Conversation className="relative size-full" style={{ height: "498px" }}>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquareIcon className="size-6" />}
              title="Start a conversation"
              description="Messages will appear here as the conversation progresses."
            />
          ) : (
            messages.map((message, index) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text": // we don't use any reasoning or tool calls in this example
                        return (
                          <Response key={`${message.id}-${i}`}>
                            {part.text}
                          </Response>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
                {/* <MessageAvatar name={message.role} src={message.role === "user" ? "" : ""} /> */}
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

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
