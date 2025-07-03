// app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const systemPrompt = `You are a helpful assistant that specializes in outfit recommendations and weather analysis. 

You have access to an MCP server with outfit logging tools. Always think about whether you would benefit from using one of the tools before responding.

Always provide detailed explanations for your suggestions.

---

User: `;

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: systemPrompt + prompt,
    stream: true,
    tools: [
      {
        type: "mcp",
        server_label: "layers-mcp",
        server_url: "https://layers2.vercel.app/api/mcp",
        require_approval: "never",
      },
    ],
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of response) {
          // Stream only meaningful text delta events
          if (event.type === "response.output_text.delta" && event.delta) {
            const payload = {
              type: event.type,
              delta: event.delta,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : String(error) })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
