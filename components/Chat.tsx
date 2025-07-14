'use client';

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStickToBottom } from "use-stick-to-bottom";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 5,
  });

  const { scrollRef, contentRef } = useStickToBottom();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden border-l">
      <ScrollArea className="h-[calc(100vh-10rem)] px-4 py-2" viewportRef={scrollRef}>
        <div className="space-y-2 w-full" ref={contentRef}>
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm shadow-sm transition-all duration-200
                  ${message.role === 'user' ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto"}
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
                          {/* {part.toolInvocation.toolName}({Object.entries(part.toolInvocation.args).map(([key, value]) => `${key}: ${value}`).join(', ')}){part.toolInvocation.state === "result" && <CheckCircleIcon className="size-3 text-green-600 inline" />} */}
                          {part.toolInvocation.toolName}(){part.toolInvocation.state === "result" && <CheckCircleIcon className="size-3 text-green-600 inline" />}
                        </div>
                      );
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="px-4 pb-2 bg-background w-full"
      >
        <div className="relative flex-1 border rounded-lg bg-background">
          <ScrollArea className="h-20 w-full">
            <Textarea
              className="w-full resize-none border-none p-3 pr-12 shadow-none outline-none ring-0 bg-transparent focus-visible:ring-0 min-h-[80px] max-h-[80px]"
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
          </ScrollArea>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "absolute bottom-2 right-2 gap-1.5 rounded-lg transition-all duration-250",
              input.trim() && !isLoading
                ? "bg-primary"
                : "bg-primary/50 hover:bg-primary/50"
            )}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}