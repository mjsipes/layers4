import { openai } from "@ai-sdk/openai";
import { streamText, generateObject } from "ai";
import { z } from "zod";
import { getWeatherTool } from "./get-weather-tool";
import { selectLayersTool, insertLayerTool, deleteLayerTool , updateLayerTool, semanticSearchLayerTool} from "./layer-tools";
import { selectLogsTool, insertLogTool, deleteLogTool, updateLogTool, linkLogLayerTool, unlinkLogLayerTool, linkLogLayerRecTool, unlinkLogLayerRecTool } from "./log-tools";
import { displayUITool, setLocationTool, getLocationTool, getCurrentUITool, setClothingInputTool } from "./global-tools";
import { getDateTool } from "./get-date-tool";
import { view_recommendations_tool, set_recommendations_tool, delete_recommendations_tool } from "./get-recommendations-tool";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// Zod schema for clothing analysis response
const ClothingAnalysisSchema = z.object({
  matched_layers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    warmth: z.number().nullable(),
    similarity: z.number().min(0).max(1),
  })),
  proposed_layers: z.array(z.object({
    name: z.string(),
    description: z.string(),
    warmth: z.number().min(1).max(10),
  })),
});

// Helper function to check if message is clothing analysis
function isClothingAnalysis(messages: any[]): boolean {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') return false;
  
  const content = lastMessage.content.toLowerCase();
  return content.includes('what they wore today') || 
         content.includes('description by the user of what they wore') ||
         content.includes('wearing today');
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("🔍 Messages received:", messages);

  // Check if this is a clothing analysis request
  if (isClothingAnalysis(messages)) {
    console.log("👕 Detected clothing analysis request, using structured response");
    
    try {
      // Get user's layers first
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { data: layers } = await supabase
        .from("layers")
        .select("*")
        .eq("user_id", user.id);

      // Generate structured clothing analysis
      const result = await generateObject({
        model: openai("gpt-4o"),
        schema: ClothingAnalysisSchema,
        messages,
        system: `You are analyzing a user's clothing description. Here are their existing layers: ${JSON.stringify(layers || [])}

Analyze the clothing description and return:
1. matched_layers: Items from the description that match existing layers (similarity 0.8-1.0)
2. proposed_layers: New clothing items not in existing layers (warmth 1=very light to 10=very warm)

Be smart about matching - consider synonyms, abbreviations, and partial matches.`,
      });

      console.log("🎯 Structured clothing analysis result:", result.object);
      
      return new Response(JSON.stringify(result.object), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("💥 Error in clothing analysis:", error);
      return new Response(JSON.stringify({ error: "Analysis failed" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // For non-clothing analysis, use the existing tool-based approach
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: "You are an AI wardrobe and weather assistant. When providing outfit recommendations, be thoughtful: consider the current weather, available wardrobe layers, and past user logs to infer preferences. Be concise in your responses, but always provide reasoning when asked. When sharing recommendations, always call the set_recommendations tool first to update the UI with the new recommendations. Before calling the set_recommendations tool, you should call the delete_recommendations tool to delete any existing recommendations for the same date and location.",
    tools: {
      get_weather: getWeatherTool,
      get_date: getDateTool,
      select_layers: selectLayersTool,
      insert_layer: insertLayerTool,
      delete_layer: deleteLayerTool,
      update_layer: updateLayerTool,
      semantic_search_layer: semanticSearchLayerTool,
      select_logs: selectLogsTool,
      insert_log: insertLogTool,
      delete_log: deleteLogTool,
      update_log: updateLogTool,
      link_log_layer: linkLogLayerTool,
      unlink_log_layer: unlinkLogLayerTool,
      link_log_layer_rec: linkLogLayerRecTool,
      unlink_log_layer_rec: unlinkLogLayerRecTool,
      display_ui: displayUITool,
      set_location: setLocationTool,
      get_location: getLocationTool,
      get_current_ui: getCurrentUITool,
      view_recommendations: view_recommendations_tool,
      set_recommendations: set_recommendations_tool,
      delete_recommendations: delete_recommendations_tool,
    },
  });

  return result.toDataStreamResponse();
}
