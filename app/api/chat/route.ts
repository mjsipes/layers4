import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { rollDiceTool } from "./tools/roll-dice";
import { getWeatherTool } from "./tools/get-weather";
import { selectLayersTool, insertLayerTool, deleteLayerTool , updateLayerTool} from "./tools/layers";
import { selectOutfitsTool, insertOutfitTool, deleteOutfitTool, updateOutfitTool, selectOutfitByIdTool } from "./tools/outfits";
import { selectLogsTool, insertLogTool, deleteLogTool, updateLogTool } from "./tools/logs";
import { getUserInfoTool } from "./tools/get-user-info";
import { setuiTool } from "./tools/global";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    tools: {
      roll_dice: rollDiceTool,
      get_weather: getWeatherTool,
      get_user_info: getUserInfoTool,
      select_layers: selectLayersTool,
      insert_layer: insertLayerTool,
      delete_layer: deleteLayerTool,
      update_layer: updateLayerTool,
      select_outfits: selectOutfitsTool,
      select_outfit_by_id: selectOutfitByIdTool,
      insert_outfit: insertOutfitTool,
      delete_outfit: deleteOutfitTool,
      update_outfit: updateOutfitTool,
      select_logs: selectLogsTool,
      insert_log: insertLogTool,
      delete_log: deleteLogTool,
      update_log: updateLogTool,
      setui: setuiTool,
    },
  });

  return result.toDataStreamResponse();
}
