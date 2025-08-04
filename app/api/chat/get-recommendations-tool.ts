import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const get_cached_recommendations = tool({
  description: "Get cached outfit recommendations for a specific date. Returns the recommendations if they exist, otherwise returns null.",
  parameters: z.object({
    date: z.string().describe("The date to check for recommendations (YYYY-MM-DD format)"),
  }),
  execute: async ({ date }) => {
    try {
      const supabase = await createClient();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
          recommendations: null,
        };
      }

      // Check if recommendations exist for this date and user
      const { data: recommendations, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("date", date)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recommendations:", error);
        return {
          success: false,
          error: "Failed to fetch recommendations",
          recommendations: null,
        };
      }

      if (!recommendations || recommendations.length === 0) {
        return {
          success: true,
          error: null,
          recommendations: null,
          message: "No recommendations found for this date",
        };
      }

      // For each recommendation, fetch the associated layers
      const recommendationsWithLayers = [];
      for (const recommendation of recommendations) {
        if (recommendation.layers && recommendation.layers.length > 0) {
          const { data: layersData, error: layersError } = await supabase
            .from("layer")
            .select("id, name, description, warmth, top, bottom")
            .in("id", recommendation.layers);

          if (layersError) {
            console.error("Error fetching layers for recommendation:", layersError);
            continue;
          }

          recommendationsWithLayers.push({
            ...recommendation,
            layerDetails: layersData || [],
          });
        } else {
          recommendationsWithLayers.push({
            ...recommendation,
            layerDetails: [],
          });
        }
      }

      return {
        success: true,
        error: null,
        recommendations: recommendationsWithLayers,
        message: `Found ${recommendationsWithLayers.length} recommendation(s) for ${date}`,
      };
    } catch (error) {
      console.error("Unexpected error in get_cached_recommendations:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
        recommendations: null,
      };
    }
  },
});

export const set_recommendations_tool = tool({
  description: "Set weather recommendations for a specific date and location. Takes an array of layer UUIDs, reasoning text, latitude, and longitude.",
  parameters: z.object({
    date: z.string().describe("The date for the recommendations (YYYY-MM-DD format)"),
    layer_uuids: z.array(z.string()).describe("Array of layer UUIDs to recommend"),
    reasoning: z.string().describe("The reasoning for why these layers are recommended"),
    latitude: z.number().describe("The latitude coordinate for the location"),
    longitude: z.number().describe("The longitude coordinate for the location"),
  }),
  execute: async ({ date, layer_uuids, reasoning, latitude, longitude }) => {
    try {
      const supabase = await createClient();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      // Validate that all layer UUIDs exist
      if (layer_uuids.length > 0) {
        const { data: existingLayers, error: layersError } = await supabase
          .from("layer")
          .select("id")
          .in("id", layer_uuids);

        if (layersError) {
          console.error("Error validating layers:", layersError);
          return {
            success: false,
            error: "Failed to validate layers",
          };
        }

        const existingLayerIds = existingLayers?.map((layer: { id: string }) => layer.id) || [];
        const invalidLayers = layer_uuids.filter((uuid: string) => !existingLayerIds.includes(uuid));
        
        if (invalidLayers.length > 0) {
          return {
            success: false,
            error: `Invalid layer UUIDs: ${invalidLayers.join(", ")}`,
          };
        }
      }

      // Clear any existing recommendations for this date and user
      const { error: deleteError } = await supabase
        .from("recommendations")
        .delete()
        .eq("date", date)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error clearing existing recommendations:", deleteError);
        return {
          success: false,
          error: "Failed to clear existing recommendations",
        };
      }

      // Insert the new recommendation with rounded lat/lon
      const { data: newRecommendation, error: insertError } = await supabase
        .from("recommendations")
        .insert({
          date,
          layers: layer_uuids,
          reasoning,
          user_id: user.id,
          latitude: Math.round(latitude * 100) / 100, // Round to 2 decimal places
          longitude: Math.round(longitude * 100) / 100, // Round to 2 decimal places
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting recommendation:", insertError);
        return {
          success: false,
          error: "Failed to save recommendation",
        };
      }

      return {
        success: true,
        error: null,
        recommendation: newRecommendation,
        message: `Successfully set recommendations for ${date} with ${layer_uuids.length} layer(s)`,
      };
    } catch (error) {
      console.error("Unexpected error in set_recommendations_tool:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },
});

export const clear_recommendations_tool = tool({
  description: "Clear weather recommendations for a specific date.",
  parameters: z.object({
    date: z.string().describe("The date to clear recommendations for (YYYY-MM-DD format)"),
  }),
  execute: async ({ date }) => {
    try {
      const supabase = await createClient();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      // Delete recommendations for this date and user
      const { error: deleteError } = await supabase
        .from("recommendations")
        .delete()
        .eq("date", date)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error clearing recommendations:", deleteError);
        return {
          success: false,
          error: "Failed to clear recommendations",
        };
      }

      return {
        success: true,
        error: null,
        message: `Successfully cleared recommendations for ${date}`,
      };
    } catch (error) {
      console.error("Unexpected error in clear_recommendations_tool:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },
}); 