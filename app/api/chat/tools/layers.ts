
import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const selectLayersTool = tool({
  description: "Get all layers from the database for the authenticated user",
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
        console.error("🔴 [LAYERS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [LAYERS] User data received:", { id: user.id });

      const { data: layers, error: fetchError } = await supabase
        .from("layer")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("🔴 [LAYERS] Error fetching layers:", fetchError);
        return `❌ Failed to fetch layers: ${fetchError.message}`;
      }

      if (!layers || layers.length === 0) {
        return "📝 No layers found in your wardrobe";
      }

      console.log("🟢 [LAYERS] Layers fetched successfully:", layers);
      return `🧥 Found ${layers.length} layer(s) in your wardrobe:\n${JSON.stringify(layers, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [LAYERS] Failed to fetch layers:", error);
      return `⚠️ Failed to fetch layers: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const insertLayerTool = tool({
  description: "Create a new layer in the database",
  parameters: z.object({
    name: z.string().describe("Name of the layer"),
    description: z.string().optional().describe("Description of the layer"),
    warmth: z.number().min(1).max(10).optional().describe("Warmth level of the layer from 1-10"),
  }),
  execute: async ({ name, description, warmth }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [LAYERS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [LAYERS] User data received:", { id: user.id });

      const insertData = {
        name,
        description: description || null,
        warmth: warmth || null,
        user_id: user.id,
      };

      console.log("🔵 [LAYERS] Inserting layer data:", insertData);

      const { data: newLayer, error: createError } = await supabase
        .from("layer")
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        console.error("🔴 [LAYERS] Error creating layer:", createError);
        return `❌ Failed to create layer: ${createError.message}`;
      }

      console.log("🟢 [LAYERS] Layer inserted successfully:", newLayer);
      return `✅ Successfully created layer: ${JSON.stringify(newLayer, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [LAYERS] Failed to create layer:", error);
      return `⚠️ Failed to create layer: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const deleteLayerTool = tool({
  description: "Delete a layer from the database by its ID",
  parameters: z.object({
    id: z.string().describe("ID of the layer to delete"),
  }),
  execute: async ({ id }) => {
    try {
      const supabase = await createClient();

      console.log("🔵 [LAYERS] Attempting to delete layer with ID:", id);

      const { error: deleteError } = await supabase
        .from("layer")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("🔴 [LAYERS] Error deleting layer:", deleteError);
        return `❌ Failed to delete layer: ${deleteError.message}`;
      }

      console.log("🟢 [LAYERS] Layer deleted successfully:", id);
      return `✅ Successfully deleted layer with ID: ${id}`;
    } catch (error: unknown) {
      console.error("🔴 [LAYERS] Failed to delete layer:", error);
      return `⚠️ Failed to delete layer: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
