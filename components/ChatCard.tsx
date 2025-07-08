"use client";

import { useState, useEffect, useRef } from "react";
import { useChatStream } from "@/hooks/useChatStream";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp } from "lucide-react";

export default function ChatCard() {
  const { isLoading, data, sendMessage } = useChatStream();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "AI Assistant",
      content: "Hi, how can I help you today?",
      isUser: false,
    },
  ]);
  
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentResponseId = useRef<number | null>(null);

  useEffect(() => {
    if (data && currentResponseId.current) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentResponseId.current
            ? { ...msg, content: data }
            : msg,
        ),
      );
    }
  }, [data]);

  useEffect(() => {
    if (isLoading && !currentResponseId.current) {
      const newResponseId = Date.now();
      currentResponseId.current = newResponseId;

      const aiMessage = {
        id: newResponseId,
        sender: "AI Assistant",
        content: "",
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } else if (!isLoading && currentResponseId.current) {
      currentResponseId.current = null;
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatConversation = (messagesArr: { isUser: boolean; content: string }[]) => {
    return messagesArr
      .filter((msg) => msg.content.trim())
      .map((msg) => `${msg.isUser ? "User" : "AI"}: ${msg.content}`)
      .join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now() + 1,
      sender: "You",
      content: input,
      isUser: true,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    const conversationString = formatConversation(newMessages);
    await sendMessage(conversationString);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <ScrollArea className="h-[calc(100vh-8rem)] px-4 py-2" ref={scrollAreaRef}>
        <div className="space-y-2 w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm shadow-sm transition-all duration-200
                  ${message.isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto"}
                  ${message.content.length > 120 ? "w-full" : "max-w-[80%]"}
                `}
              >
                {message.content}
                {!message.isUser && !message.content && isLoading && (
                  <span className="text-muted-foreground animate-pulse">
                    Thinking...
                  </span>
                )}
              </div>
            </div>
          ))}
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
            onChange={(e) => setInput(e.target.value)}
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