import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { TablesUpdate } from "@/lib/supabase/database.types";
import { pipeline } from '@xenova/transformers';

export const selectLayersTool = tool({
  description: "Get all layers from the database for the authenticated user",
  parameters: z.object({}),
  execute: async () => {
    try {

      console.log("selectLayersTool: Executing");
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("selectLayersTool: error getting user:", userError);
        return `selectLayersTool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("selectLayersTool: no authenticated user found");
        return `selectLayersTool: No authenticated user found.`;
      }
      console.log("selectLayersTool: User data received:", { id: user.id });

      const { data: layers, error: fetchError } = await supabase
        .from("layer")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (fetchError) {
        console.error("selectLayersTool: Error fetching layers:", fetchError);
        return `selectLayersTool: Failed to fetch layers: ${fetchError.message}`;
      }
      console.log("selectLayersTool: Layers fetched successfully:", layers);
      return `selectLayersTool: Found ${layers.length} layer(s) in your wardrobe:\n${JSON.stringify(layers, null, 2)}`;

    } catch (error: unknown) {
      console.error("selectLayersTool: error:", error);
      return `selectLayersTool: error: ${
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

      console.log("insertLayerTool: Executing with:", { name, description, warmth });
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("insertLayerTool: Error getting user:", userError);
        return `insertLayerTool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("insertLayerTool: no authenticated user found");
        return `insertLayerTool: No authenticated user found.`;
      }
      console.log("insertLayerTool: User data received:", { id: user.id });

      const insertData = {
        name,
        description: description || null,
        warmth: warmth || null,
        user_id: user.id,
      };
      console.log("insertLayerTool: Inserting layer data:", insertData);
      const { data: newLayer, error: createError } = await supabase
        .from("layer")
        .insert(insertData)
        .select()
        .single();
      if (createError) {
        console.error("insertLayerTool: Error creating layer:", createError);
        return `insertLayerTool: Failed to create layer: ${createError.message}`;
      }
      console.log("insertLayerTool: Layer inserted successfully:", newLayer);
      return `insertLayerTool: Successfully created layer: ${JSON.stringify(newLayer, null, 2)}`;

    } catch (error: unknown) {
      console.error("insertLayerTool: error:", error);
      return `insertLayerTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const updateLayerTool = tool({
  description: "Update an existing layer in the database",
  parameters: z.object({
    id: z.string().describe("ID of the layer to update"),
    name: z.string().optional().describe("New name of the layer"),
    description: z.string().optional().describe("New description of the layer"),
    warmth: z.number().min(1).max(10).optional().describe("New warmth level of the layer from 1-10"),
  }),
  execute: async ({ id, name, description, warmth }) => {
    try {

      console.log("updateLayerTool: Executing with:", { id, name, description, warmth });
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("updateLayerTool: Error getting user:", userError);
        return `updateLayerTool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("updateLayerTool: no authenticated user found");
        return `updateLayerTool: No authenticated user found.`;
      }
      console.log("updateLayerTool: User data received:", { id: user.id });

      const updateData: TablesUpdate<"layer"> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (warmth !== undefined) updateData.warmth = warmth;
      if (Object.keys(updateData).length === 0) {
        console.error("updateLayerTool: No fields provided to update");
        return `updateLayerTool: No fields provided to update.`;
      }
      console.log("updateLayerTool: Updating layer data:", { id, updateData });
      const { data: updatedLayer, error: updateError } = await supabase
        .from("layer")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (updateError) {
        console.error("updateLayerTool: Error updating layer:", updateError);
        return `updateLayerTool: Failed to update layer: ${updateError.message}`;
      }
      if (!updatedLayer) {
        console.error("updateLayerTool: Layer with ID ${id} not found or you don't have permission to update it.");
        return `updateLayerTool: Layer with ID ${id} not found or you don't have permission to update it.`;
      }
      console.log("updateLayerTool: Layer updated successfully:", updatedLayer);
      return `updateLayerTool: Successfully updated layer: ${JSON.stringify(updatedLayer, null, 2)}`;
      
    } catch (error: unknown) {
      console.error("updateLayerTool: error:", error);
      return `updateLayerTool: error: ${
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

      console.log("deleteLayerTool: Executing with:", { id });
      const supabase = await createClient();
      const { error: deleteError } = await supabase
        .from("layer")
        .delete()
        .eq("id", id);
      if (deleteError) {
        console.error("deleteLayerTool: Error deleting layer:", deleteError);
        return `deleteLayerTool: Failed to delete layer: ${deleteError.message}`;
      }
      console.log("deleteLayerTool: Layer deleted successfully:", id);
      return `deleteLayerTool: Successfully deleted layer with ID: ${id}`;

    } catch (error: unknown) {
      console.error("deleteLayerTool: error:", error);
      return `deleteLayerTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});



export const semanticSearchLayerTool = tool({
  description: "Search for layers using semantic similarity. Takes a query and finds the most similar layers in the user's wardrobe. Optionally accepts match_threshold (0-1, default 0.78) and match_count (default 5) to control search sensitivity and number of results.",
  parameters: z.object({
    query: z.string().describe("The search query to find similar layers"),
    match_threshold: z.number().min(0).max(1).optional().describe("Similarity threshold from 0-1 (default: 0.78). Higher values = more strict matching."),
    match_count: z.number().min(1).max(20).optional().describe("Number of results to return (default: 5, max: 20)"),
  }),
  execute: async ({ query, match_threshold = 0.78, match_count = 5 }) => {
    try {
      console.log("semanticSearchLayerTool: Executing with:", { query, match_threshold, match_count });
      
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("semanticSearchLayerTool: Error getting user:", userError);
        return `semanticSearchLayerTool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("semanticSearchLayerTool: no authenticated user found");
        return `semanticSearchLayerTool: No authenticated user found.`;
      }
      console.log("semanticSearchLayerTool: User data received:", { id: user.id });

      // Initialize embedding pipeline
      console.log("semanticSearchLayerTool: Initializing embedding pipeline...");
      const generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small');
      
      // Generate embedding for the query
      console.log("semanticSearchLayerTool: Generating embedding for query:", query);
      const output = await generateEmbedding(query, {
        pooling: 'mean',
        normalize: true,
      });
      const embedding = Array.from(output.data) as number[];
      console.log("semanticSearchLayerTool: Generated embedding with", embedding.length, "dimensions");

      // Call the RPC function to find similar layers
      console.log("semanticSearchLayerTool: Calling match_layer RPC function...");
      const { data: matches, error: matchError } = await supabase.rpc('match_layer', {
        query_embedding: embedding,
        match_threshold,
        match_count,
      });

      if (matchError) {
        console.error("semanticSearchLayerTool: Error matching layers:", matchError);
        return `semanticSearchLayerTool: Failed to find similar layers: ${matchError.message}`;
      }

      console.log("semanticSearchLayerTool: Found", matches?.length || 0, "matches");
      
      if (!matches || matches.length === 0) {
        return `semanticSearchLayerTool: No similar layers found for query "${query}". Try a different search term or lower the match_threshold.`;
      }

      return `semanticSearchLayerTool: Found ${matches.length} similar layers for "${query}":\n${JSON.stringify(matches, null, 2)}`;

    } catch (error: unknown) {
      console.error("semanticSearchLayerTool: error:", error);
      return `semanticSearchLayerTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
