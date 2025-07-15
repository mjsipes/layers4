import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { TablesUpdate, Tables } from "@/lib/supabase/database.types";

export const selectOutfitsTool = tool({
  description: "Get all outfits from the database for the authenticated user",
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
        console.error("🔴 [OUTFITS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [OUTFITS] User data received:", { id: user.id });

      const { data: outfits, error: fetchError } = await supabase
        .from("outfit")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("🔴 [OUTFITS] Error fetching outfits:", fetchError);
        return `❌ Failed to fetch outfits: ${fetchError.message}`;
      }

      if (!outfits || outfits.length === 0) {
        return "📝 No outfits found in your wardrobe";
      }

      console.log("🟢 [OUTFITS] Outfits fetched successfully:", outfits);
      return `👔 Found ${outfits.length} outfit(s) in your wardrobe:\n${JSON.stringify(outfits, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [OUTFITS] Failed to fetch outfits:", error);
      return `⚠️ Failed to fetch outfits: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const insertOutfitTool = tool({
  description: "Create a new outfit in the database",
  parameters: z.object({
    name: z.string().describe("Name of the outfit"),
    total_warmth: z.number().optional().describe("Total warmth level of the outfit"),
  }),
  execute: async ({ name, total_warmth }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [OUTFITS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [OUTFITS] User data received:", { id: user.id });

      const insertData = {
        name,
        total_warmth: total_warmth || null,
        user_id: user.id,
      };

      console.log("🔵 [OUTFITS] Inserting outfit data:", insertData);

      const { data: newOutfit, error: createError } = await supabase
        .from("outfit")
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        console.error("🔴 [OUTFITS] Error creating outfit:", createError);
        return `❌ Failed to create outfit: ${createError.message}`;
      }

      console.log("🟢 [OUTFITS] Outfit inserted successfully:", newOutfit);
      return `✅ Successfully created outfit: ${JSON.stringify(newOutfit, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [OUTFITS] Failed to create outfit:", error);
      return `⚠️ Failed to create outfit: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const updateOutfitTool = tool({
  description: "Update an existing outfit in the database",
  parameters: z.object({
    id: z.string().describe("ID of the outfit to update"),
    name: z.string().optional().describe("New name of the outfit"),
    total_warmth: z.number().optional().describe("New total warmth level of the outfit"),
  }),
  execute: async ({ id, name, total_warmth }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [OUTFITS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [OUTFITS] User data received:", { id: user.id });

      // Build update data object with only provided fields
      const updateData: TablesUpdate<"outfit"> = {};
      if (name !== undefined) updateData.name = name;
      if (total_warmth !== undefined) updateData.total_warmth = total_warmth;

      if (Object.keys(updateData).length === 0) {
        return `❌ No fields provided to update. Please provide at least one field (name or total_warmth).`;
      }

      console.log("🔵 [OUTFITS] Updating outfit data:", { id, updateData });

      const { data: updatedOutfit, error: updateError } = await supabase
        .from("outfit")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id) // Ensure user can only update their own outfits
        .select()
        .single();

      if (updateError) {
        console.error("🔴 [OUTFITS] Error updating outfit:", updateError);
        return `❌ Failed to update outfit: ${updateError.message}`;
      }

      if (!updatedOutfit) {
        return `❌ Outfit with ID ${id} not found or you don't have permission to update it.`;
      }

      console.log("🟢 [OUTFITS] Outfit updated successfully:", updatedOutfit);
      return `✅ Successfully updated outfit: ${JSON.stringify(updatedOutfit, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [OUTFITS] Failed to update outfit:", error);
      return `⚠️ Failed to update outfit: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const deleteOutfitTool = tool({
  description: "Delete an outfit from the database by its ID",
  parameters: z.object({
    id: z.string().describe("ID of the outfit to delete"),
  }),
  execute: async ({ id }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [OUTFITS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🔵 [OUTFITS] Attempting to delete outfit with ID:", id);

      const { error: deleteError } = await supabase
        .from("outfit")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Ensure user can only delete their own outfits

      if (deleteError) {
        console.error("🔴 [OUTFITS] Error deleting outfit:", deleteError);
        return `❌ Failed to delete outfit: ${deleteError.message}`;
      }

      console.log("🟢 [OUTFITS] Outfit deleted successfully:", id);
      return `✅ Successfully deleted outfit with ID: ${id}`;
    } catch (error: unknown) {
      console.error("🔴 [OUTFITS] Failed to delete outfit:", error);
      return `⚠️ Failed to delete outfit: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const selectOutfitByIdTool = tool({
  description: "Get a specific outfit by ID with its layers from the database for the authenticated user",
  parameters: z.object({
    id: z.string().describe("ID of the outfit to fetch"),
  }),
  execute: async ({ id }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [OUTFITS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [OUTFITS] User data received:", { id: user.id });

      const { data: outfit, error: fetchError } = await supabase
        .from("outfit")
        .select(
          `
          *,
          outfit_layer(
            layer:layer(*)
          )
        `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        console.error("🔴 [OUTFITS] Error fetching outfit:", fetchError);
        return `❌ Failed to fetch outfit: ${fetchError.message}`;
      }

      if (!outfit) {
        return `❌ Outfit with ID ${id} not found or you don't have permission to access it.`;
      }

      console.log("🟢 [OUTFITS] Outfit fetched successfully:", outfit);

      // Transform the data to match the store structure
      const outfitWithLayers = {
        ...outfit,
        layers: outfit.outfit_layer?.map((ol: { layer: Tables<"layer"> }) => ol.layer) ?? [],
      };

      return `👔 Outfit Details:\n${JSON.stringify(outfitWithLayers, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [OUTFITS] Failed to fetch outfit:", error);
      return `⚠️ Failed to fetch outfit: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const linkOutfitLayerTool = tool({
  description: "Link a layer to an outfit by creating a record in the outfit_layer join table. Use this when the user wants to add a layer to an outfit.",
  parameters: z.object({
    outfit_id: z.string().describe("ID of the outfit to link the layer to"),
    layer_id: z.string().describe("ID of the layer to link to the outfit"),
  }),
  execute: async ({ outfit_id, layer_id }) => {
    console.log(`[OUTFITS] Linking layer to outfit:`, { outfit_id, layer_id });
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [OUTFITS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [OUTFITS] User data received:", { id: user.id });

      // Verify that both the outfit and layer belong to the user
      const { data: outfit, error: outfitError } = await supabase
        .from("outfit")
        .select("id")
        .eq("id", outfit_id)
        .eq("user_id", user.id)
        .single();

      if (outfitError || !outfit) {
        console.error("🔴 [OUTFITS] Error verifying outfit:", outfitError);
        return `❌ Outfit with ID ${outfit_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();
      console.log("[OUTFITS] Layer fetch result:", { layer, layerError });

      if (layerError || !layer) {
        console.error("🔴 [OUTFITS] Error verifying layer:", layerError);
        return `❌ Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      // Check if the link already exists
      const { data: existingLink, error: checkError } = await supabase
        .from("outfit_layer")
        .select("id")
        .eq("outfit_id", outfit_id)
        .eq("layer_id", layer_id)
        .single();
      console.log("[OUTFITS] Existing link fetch result:", { existingLink, checkError });

      // if (checkError){
      //   return checkError;
      // }

      if (existingLink) {
        return `⚠️ Layer ${layer_id} is already linked to outfit ${outfit_id}.`;
      }

      // Already logged above

      const { data: newLink, error: linkError } = await supabase
        .from("outfit_layer")
        .insert({
          outfit_id: outfit_id,
          layer_id: layer_id,
        })
        .select()
        .single();
      console.log("[OUTFITS] New link result:", { newLink, linkError });


      if (linkError) {
        console.error("🔴 [OUTFITS] Error linking layer to outfit:", linkError);
        return `❌ Failed to link layer to outfit: ${linkError.message}`;
      }

      console.log("🟢 [OUTFITS] Layer linked to outfit successfully:", newLink);
      return `✅ Successfully linked layer ${layer_id} to outfit ${outfit_id}`;
    } catch (error: unknown) {
      console.error("🔴 [OUTFITS] Failed to link layer to outfit:", error);
      return `⚠️ Failed to link layer to outfit: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const unlinkOutfitLayerTool = tool({
  description: "Unlink a layer from an outfit by removing the record from the outfit_layer join table. Use this when the user wants to remove a layer from an outfit.",
  parameters: z.object({
    outfit_id: z.string().describe("ID of the outfit to unlink the layer from"),
    layer_id: z.string().describe("ID of the layer to unlink from the outfit"),
  }),
  execute: async ({ outfit_id, layer_id }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [OUTFITS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [OUTFITS] User data received:", { id: user.id });

      // Verify that both the outfit and layer belong to the user
      const { data: outfit, error: outfitError } = await supabase
        .from("outfit")
        .select("id")
        .eq("id", outfit_id)
        .eq("user_id", user.id)
        .single();

      if (outfitError || !outfit) {
        console.error("🔴 [OUTFITS] Error verifying outfit:", outfitError);
        return `❌ Outfit with ID ${outfit_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();

      if (layerError || !layer) {
        console.error("🔴 [OUTFITS] Error verifying layer:", layerError);
        return `❌ Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      console.log("🔵 [OUTFITS] Unlinking layer from outfit:", { outfit_id, layer_id });

      const { error: unlinkError } = await supabase
        .from("outfit_layer")
        .delete()
        .eq("outfit_id", outfit_id)
        .eq("layer_id", layer_id);

      if (unlinkError) {
        console.error("🔴 [OUTFITS] Error unlinking layer from outfit:", unlinkError);
        return `❌ Failed to unlink layer from outfit: ${unlinkError.message}`;
      }

      console.log("🟢 [OUTFITS] Layer unlinked from outfit successfully");
      return `✅ Successfully unlinked layer ${layer_id} from outfit ${outfit_id}`;
    } catch (error: unknown) {
      console.error("🔴 [OUTFITS] Failed to unlink layer from outfit:", error);
      return `⚠️ Failed to unlink layer from outfit: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
