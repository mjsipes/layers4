import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('Chat API called');
  const { messages } = await req.json();

  try {
    // Manually call your MCP API route to get the tools
    const toolsRes = await fetch('https://layers2.vercel.app/api/mcp/tools');
    const tools = await toolsRes.json();

    const result = streamText({
      model: openai('gpt-4.5-preview'),
      messages,
      tools,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('MCP connection error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
