'use client';

import { useChat } from 'ai/react';

export default function ChatCard() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: '/api/chat', // Make sure this matches your route
  });

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something..."
          className="w-full border rounded p-2"
        />
      </form>

      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong> {m.content}
          </div>
        ))}
        {isLoading && <div>Typing...</div>}
      </div>
    </div>
  );
}
