import { useState, useCallback } from "react";

export function useChatStream() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState("");

  const sendMessage = useCallback(async (conversation: string) => {
    if (!conversation?.trim()) return;

    setIsLoading(true);
    setData("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: conversation }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim()) {
              try {
                const event = JSON.parse(jsonStr);
                if (event.type === "response.output_text.delta" && event.delta) {
                  setData((prev) => prev + event.delta);
                }
              } catch {
                console.warn("Failed to parse event:", jsonStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData("");
  }, []);

  return {
    isLoading,
    data,
    sendMessage,
    clearData,
  };
}