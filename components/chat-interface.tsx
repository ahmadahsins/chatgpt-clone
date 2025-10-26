"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a simulated response. Connect to your AI backend to get real responses.",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground">Start a conversation by typing a message below</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-8 flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="relative flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              className="min-h-[60px] max-h-[200px] resize-none pr-12"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
