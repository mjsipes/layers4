'use client';

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 5,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    const timer = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden border-l">
      <ScrollArea className="h-[calc(100vh-8rem)] px-4 py-2">
        <div className="space-y-2 w-full">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm shadow-sm transition-all duration-200
                  ${message.role === 'user' ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto"}
                  max-w-[80%]
                `}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <div key={`${message.id}-${i}`}>
                          <ReactMarkdown>{part.text}</ReactMarkdown>
                        </div>
                      );
                    case 'tool-invocation':
                      return (
                        <div key={`${message.id}-${i}`} className="text-xs text-muted-foreground font-mono">
                          {part.toolInvocation.toolName}({Object.entries(part.toolInvocation.args).map(([key, value]) => `${key}: ${value}`).join(', ')})
                        </div>
                      );
                  }
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

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
            onKeyPress={handleKeyPress}
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