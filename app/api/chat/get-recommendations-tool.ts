import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const view_recommendations_tool = tool({
  description: "View outfit recommendations for a specific date and location.",
  parameters: z.object({
    date: z.string().describe("The date to check for recommendations (YYYY-MM-DD format)"),
    latitude: z.number().describe("The latitude coordinate for the location"),
    longitude: z.number().describe("The longitude coordinate for the location"),
  }),
  execute: async ({ date, latitude, longitude }) => {
    console.log("view_recommendations_tool: START");
    console.log("view_recommendations_tool: params:", { date, latitude, longitude });
    
    try {
      const supabase = await createClient();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log("view_recommendations_tool: No authenticated user");
        return {
          success: false,
          error: "User not authenticated",
          recommendations: null,
        };
      }
      
      console.log("view_recommendations_tool: user_id:", user.id);

      // Check if recommendations exist for this date, location, and user
      const roundedLat = Math.round(latitude * 100) / 100;
      const roundedLon = Math.round(longitude * 100) / 100;
      console.log("view_recommendations_tool: querying recommendations for date:", date, "user_id:", user.id, "lat:", roundedLat, "lon:", roundedLon);
      
      const { data: recommendations, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("date", date)
        .eq("user_id", user.id)
        .eq("latitude", roundedLat)
        .eq("longitude", roundedLon);

      if (error) {
        console.error("view_recommendations_tool: Error fetching recommendations:", error);
        return {
          success: false,
          error: "Failed to fetch recommendations",
          recommendations: null,
        };
      }
      
      console.log("view_recommendations_tool: found recommendations:", recommendations);

      if (!recommendations || recommendations.length === 0) {
        console.log("view_recommendations_tool: No recommendations found for date:", date);
        return {
          success: true,
          error: null,
          recommendations: null,
          message: "No recommendations found for this date",
        };
      }

      // For each recommendation, fetch the associated layers
      console.log("view_recommendations_tool: processing", recommendations.length, "recommendations");
      const recommendationsWithLayers = [];
      for (const recommendation of recommendations) {
        console.log("view_recommendations_tool: processing recommendation:", recommendation.id, "reasoning:", recommendation.reasoning);
        if (recommendation.layers && recommendation.layers.length > 0) {
          const { data: layersData, error: layersError } = await supabase
            .from("layer")
            .select("id, name, description, warmth, top, bottom")
            .in("id", recommendation.layers);

          if (layersError) {
            console.error("view_recommendations_tool: Error fetching layers for recommendation:", layersError);
            continue;
          }

          console.log("view_recommendations_tool: found", layersData?.length || 0, "layers for recommendation", recommendation.id);
          recommendationsWithLayers.push({
            id: recommendation.id,
            date: recommendation.date,
            reasoning: recommendation.reasoning,
            latitude: recommendation.latitude,
            longitude: recommendation.longitude,
            user_id: recommendation.user_id,
            created_at: recommendation.created_at,
            layers: recommendation.layers,
            layerDetails: layersData || [],
          });
        } else {
          console.log("view_recommendations_tool: no layers for recommendation", recommendation.id);
          recommendationsWithLayers.push({
            id: recommendation.id,
            date: recommendation.date,
            reasoning: recommendation.reasoning,
            latitude: recommendation.latitude,
            longitude: recommendation.longitude,
            user_id: recommendation.user_id,
            created_at: recommendation.created_at,
            layers: recommendation.layers,
            layerDetails: [],
          });
        }
      }

      console.log("view_recommendations_tool: returning", recommendationsWithLayers.length, "recommendations with layers");
      return {
        success: true,
        error: null,
        recommendations: recommendationsWithLayers,
        message: `Found ${recommendationsWithLayers.length} recommendation(s) for ${date}`,
      };
    } catch (error) {
      console.error("view_recommendations_tool: Unexpected error:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
        recommendations: null,
      };
    }
  },
});

export const set_recommendations_tool = tool({
  description: "Set weather recommendations for a specific date and location. Takes an array of layer UUIDs, reasoning text, latitude, and longitude. You should always call this function before sharing recommendations with the user. This allows the UI to be updated with the new recommendations.",
  parameters: z.object({
    date: z.string().describe("The date for the recommendations (YYYY-MM-DD format)"),
    layer_uuids: z.array(z.string()).describe("Array of layer UUIDs to recommend"),
    reasoning: z.string().describe("The reasoning for why these layers are recommended"),
    latitude: z.number().describe("The latitude coordinate for the location"),
    longitude: z.number().describe("The longitude coordinate for the location"),
  }),
  execute: async ({ date, layer_uuids, reasoning, latitude, longitude }) => {
    console.log("set_recommendations_tool: START");
    console.log("set_recommendations_tool: params:", { date, layer_uuids, reasoning, latitude, longitude });
    
    try {
      const supabase = await createClient();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log("set_recommendations_tool: No authenticated user");
        return {
          success: false,
          error: "User not authenticated",
        };
      }
      
      console.log("set_recommendations_tool: user_id:", user.id);


      // Insert the new recommendation with rounded lat/lon
      const roundedLat = Math.round(latitude * 100) / 100;
      const roundedLon = Math.round(longitude * 100) / 100;
      console.log("set_recommendations_tool: inserting recommendation with rounded coordinates:", { roundedLat, roundedLon });
      
      const { data: newRecommendation, error: insertError } = await supabase
        .from("recommendations")
        .insert({
          date,
          layers: layer_uuids,
          reasoning,
          user_id: user.id,
          latitude: roundedLat,
          longitude: roundedLon,
        })
        .select();

      if (insertError) {
        console.error("set_recommendations_tool: Error inserting recommendation:", insertError);
        return {
          success: false,
          error: "Failed to save recommendation",
        };
      }
      
      console.log("set_recommendations_tool: successfully inserted recommendation:", newRecommendation[0].id);

      console.log("set_recommendations_tool: returning success");
      return {
        success: true,
        error: null,
        recommendation: newRecommendation,
        message: `Successfully set recommendations for ${date} with ${layer_uuids.length} layer(s)`,
      };
    } catch (error) {
      console.error("set_recommendations_tool: Unexpected error:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },
});

export const delete_recommendations_tool = tool({
  description: "Delete weather recommendations for a specific date and location.",
  parameters: z.object({
    date: z.string().describe("The date to delete recommendations for (YYYY-MM-DD format)"),
    latitude: z.number().describe("The latitude coordinate for the location"),
    longitude: z.number().describe("The longitude coordinate for the location"),
  }),
  execute: async ({ date, latitude, longitude }) => {
    console.log("delete_recommendations_tool: START");
    console.log("delete_recommendations_tool: params:", { date, latitude, longitude });
    
    try {
      const supabase = await createClient();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log("delete_recommendations_tool: No authenticated user");
        return {
          success: false,
          error: "User not authenticated",
        };
      }
      
      console.log("delete_recommendations_tool: user_id:", user.id);

      // Delete recommendations for this date, location, and user
      const roundedLat = Math.round(latitude * 100) / 100;
      const roundedLon = Math.round(longitude * 100) / 100;
      console.log("delete_recommendations_tool: deleting recommendations for date:", date, "user_id:", user.id, "lat:", roundedLat, "lon:", roundedLon);
      
      const { error: deleteError } = await supabase
        .from("recommendations")
        .delete()
        .eq("date", date)
        .eq("user_id", user.id)
        .eq("latitude", roundedLat)
        .eq("longitude", roundedLon);

      if (deleteError) {
        console.error("delete_recommendations_tool: Error deleting recommendations:", deleteError);
        return {
          success: false,
          error: "Failed to delete recommendations",
        };
      }

      console.log("delete_recommendations_tool: successfully deleted recommendations");
      return {
        success: true,
        error: null,
        message: `Successfully deleted recommendations for ${date}`,
      };
    } catch (error) {
      console.error("delete_recommendations_tool: Unexpected error:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },
}); 