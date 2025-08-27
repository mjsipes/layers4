'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useChat, UseChatHelpers } from '@ai-sdk/react';

const ChatContext = createContext<UseChatHelpers | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chatHelpers = useChat({
    maxSteps: 5,
  });

  return (
    <ChatContext.Provider value={chatHelpers}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
