import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    console.log('Chat API called');
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4.5-preview'),
    messages,
  });

  return result.toDataStreamResponse();
}