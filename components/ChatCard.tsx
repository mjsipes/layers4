"use client";

import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ChatCard() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/chat" });

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollEl = scrollAreaRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Scrollable messages */}
      <ScrollArea className="flex-1 w-full px-4 py-2" ref={scrollAreaRef}>
        <div className="space-y-4 pb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm shadow-sm transition-all duration-200
                  ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted mr-auto"
                  }
                  ${m.content.length > 120 ? "w-full" : "max-w-[80%]"}
                `}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input + Send */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-border bg-background w-full"
      >
        <div className="flex gap-2 w-full">
          <Input
            className="w-full"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className={`rounded-md transition-all duration-250 ${
              input.trim() && !isLoading
                ? "bg-primary"
                : "bg-primary/50 hover:bg-primary/50"
            }`}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
