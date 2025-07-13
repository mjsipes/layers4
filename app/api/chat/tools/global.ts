import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const setuiTool = tool({
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

      const updateData = {
        selectedItemId: selectedItemId,
        selectedType: selectedType,
      };

      console.log("🔵 [GLOBAL] Updating UI state:", updateData);

      const { data: profileData, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("🔴 [GLOBAL] Error updating UI state:", updateError);
        return `❌ Failed to update UI state: ${updateError.message}`;
      }

      console.log("🟢 [GLOBAL] UI state updated successfully:", profileData);
      return `✅ Successfully updated UI state: selectedItemId=${selectedItemId}, selectedType=${selectedType}`;
    } catch (error: unknown) {
      console.error("🔴 [GLOBAL] Failed to update UI state:", error);
      return `⚠️ Failed to update UI state: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
}); 