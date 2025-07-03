import { openai } from '@ai-sdk/openai';
import { streamText, experimental_createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('Chat API called');
  const { messages } = await req.json();

  try {
    const transport = new StreamableHTTPClientTransport(
      new URL('https://layers2.vercel.app/api/mcp')
    );
    
    const mcpClient = await experimental_createMCPClient({
      transport,
    });

    const tools = await mcpClient.tools();

    const result = streamText({
      model: openai('gpt-4.5-preview'),
      messages,
      tools,
      onFinish: async () => {
        await mcpClient.close();
      },
      onError: async (error) => {
        await mcpClient.close();
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('MCP connection error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}