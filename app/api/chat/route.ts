import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getWeatherTool } from "./get-weather-tool";
import { selectLayersTool, insertLayerTool, deleteLayerTool , updateLayerTool, semanticSearchLayerTool} from "./layer-tools";
import { selectLogsTool, insertLogTool, deleteLogTool, updateLogTool, linkLogLayerTool, unlinkLogLayerTool, linkLogLayerRecTool, unlinkLogLayerRecTool } from "./log-tools";
import { displayUITool, setLocationTool, getLocationTool, getCurrentUITool } from "./global-tools";
import { getDateTool } from "./get-date-tool";
import { get_cached_recommendations, set_recommendations_tool, clear_recommendations_tool } from "./get-recommendations-tool";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: "You are an AI wardrobe and weather assistant. When providing outfit recommendations, be thoughtful: consider the current weather, available wardrobe layers, and past user logs to infer preferences. Be concise in your responses, but always provide reasoning when asked.",
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
      get_cached_recommendations: get_cached_recommendations,
      set_recommendations: set_recommendations_tool,
      clear_recommendations: clear_recommendations_tool,
    },
  });

  return result.toDataStreamResponse();
}
