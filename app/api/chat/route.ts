// app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Logging configuration
const LOGGING: "none" | "selective" | "all" = "selective";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Logging function to handle different event types
function logEvent(event: any) {
  if (LOGGING === "none") return;
  
  if (LOGGING === "all") {
    console.log("Event received:", JSON.stringify(event, null, 2));
    return;
  }
  
  // Selective logging
  if (LOGGING === "selective") {
    // Most events: just log the type
    if (event.type !== "response.output_item.done" && event.type !== "response.output_item.added") {
      console.log(`Event type: ${event.type}`);
      return;
    }
    
    // Handle mcp_list_tools completion - show available tools
    if (event.type === "response.output_item.done" && event.item?.type === "mcp_list_tools") {
      console.log("🔧 Connected MCP Tools:");
      event.item.tools?.forEach((tool: any) => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });
      return;
    }
    
    // Handle mcp_call being added - show function being called
    if (event.type === "response.output_item.added" && event.item?.type === "mcp_call") {
      const args = event.item.arguments ? ` with args: ${event.item.arguments}` : "";
      console.log(`🚀 MCP Function called: ${event.item.name}${args}`);
      return;
    }
    
    // Handle mcp_call completion - show function output
    if (event.type === "response.output_item.done" && event.item?.type === "mcp_call") {
      console.log(`✅ MCP Function ${event.item.name} result: ${event.item.output}`);
      return;
    }
    
    // For any other events in selective mode, just log the type
    console.log(`Event type: ${event.type}`);
  }
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const systemPrompt = `You are a helpful assistant that specializes in outfit recommendations and weather analysis. 

You have access to an MCP server with outfit logging tools. Always think about whether you would benefit from using one of the tools before responding.

Always provide detailed explanations for your suggestions.

---

User: `;

  const model = "gpt-4.1";
  const serverUrl = "https://layers2.vercel.app/api/mcp";

  // Log request information
  if (LOGGING !== "none") {
    console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
    console.log("║                              CHAT API REQUEST                                ║");
    console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
    console.log("Model:", model);
    console.log("Server URL:", serverUrl);
    console.log("User prompt:", prompt);
    if (LOGGING === "all") {
      console.log("Full input:", systemPrompt + prompt);
    }
    console.log("─".repeat(80));
  }

  const response = await openai.responses.create({
    model: model,
    input: systemPrompt + prompt,
    stream: true,
    tools: [
      {
        type: "mcp",
        server_label: "layers-mcp",
        server_url: serverUrl,
        require_approval: "never",
      },
    ],
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (LOGGING !== "none") {
          console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
          console.log("║                           STARTING RESPONSE STREAM                           ║");
          console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
        }
        
        for await (const event of response) {
          // Use the configurable logging function
          logEvent(event);
          
          // Stream only meaningful text delta events
          if (event.type === "response.output_text.delta" && event.delta) {
            const payload = {
              type: event.type,
              delta: event.delta,
            };
            if (LOGGING === "all") {
              console.log("Streaming text delta:", event.delta);
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          }
        }
        
        if (LOGGING !== "none") {
          console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
          console.log("║                             STREAM COMPLETE                                  ║");
          console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
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
