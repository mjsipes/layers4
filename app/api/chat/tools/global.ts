import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const displayUITool = tool({
  description: "Display or select a specific item in the UI. Use this when the user asks to 'show me', 'pull up', 'display', or 'select' a particular outfit, layer, or log. This will update the UI to show the selected item in the main display area.",
  parameters: z.object({
    selectedItemId: z.string().nullable().describe("ID of the item to display (can be null to clear selection)"),
    selectedType: z.enum([
      "selectlayer", 
      "selectoutfit", 
      "selectlog", 
      "addlayer", 
      "addoutfit", 
      "addlog", 
      "recommendations"
    ]).describe("Type of item to display: 'selectlayer' for layers, 'selectoutfit' for outfits, 'selectlog' for logs, or 'add*' for adding new items"),
  }),
  execute: async ({ selectedItemId, selectedType }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [GLOBAL] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [GLOBAL] User data received:", { id: user.id });

      // Send display command via realtime channel
      await supabase
        .channel("ui-updates")
        .send({
          type: "broadcast",
          event: "display-item",
          payload: {
            selectedItemId: selectedItemId,
            selectedType: selectedType,
          },
        });

      console.log("🟢 [GLOBAL] Display command sent successfully");
      return `✅ Successfully sent display command: selectedItemId=${selectedItemId}, selectedType=${selectedType}`;
    } catch (error: unknown) {
      console.error("🔴 [GLOBAL] Failed to send display command:", error);
      return `⚠️ Failed to send display command: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
});

export const getCurrentUITool = tool({
  description: "Get the currently selected item and type from the UI. Use this when the user asks 'what am I currently viewing?' or 'what's selected?' to understand the current UI state.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [GLOBAL] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [GLOBAL] User data received:", { id: user.id });

      // Send request for current UI state via realtime channel
      const requestId = Date.now();
      await supabase
        .channel("ui-updates")
        .send({
          type: "broadcast",
          event: "get-current-ui",
          payload: {
            requestId: requestId,
          },
        });

      console.log("🟢 [GLOBAL] Current UI state request sent successfully");
      return `✅ Requested current UI state. The client will respond with the current selection.`;
    } catch (error: unknown) {
      console.error("🔴 [GLOBAL] Failed to request current UI state:", error);
      return `⚠️ Failed to request current UI state: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
}); 