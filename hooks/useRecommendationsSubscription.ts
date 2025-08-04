import React, { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useGlobalStore } from "@/stores/global-store";

const supabase = createClient();

export interface Recommendation {
  id: number;
  created_at: string;
  date: string | null;
  layers: string[];
  reasoning: string | null;
  user_id: string | null;
}

export interface RecommendationWithLayers extends Recommendation {
  layerDetails: Array<{
    id: string;
    name: string | null;
    description: string | null;
    warmth: number | null;
    top: boolean | null;
    bottom: boolean | null;
  }>;
}

export function useRecommendationsSubscription() {
  const [recommendations, setRecommendations] = React.useState<RecommendationWithLayers[]>([]);

  // Get global state values
  const date = useGlobalStore((state) => state.date);
  const lat = useGlobalStore((state) => state.lat);
  const lon = useGlobalStore((state) => state.lon);

  // Fetch recommendations with their associated layers
  const fetchRecommendations = async () => {
    console.log("useRecommendationsSubscription/fetchRecommendations: START");
    console.log("useRecommendationsSubscription/fetchRecommendations: values:", { date, lat, lon });
    
    if (!date || !lat || !lon) {
      console.log("useRecommendationsSubscription/fetchRecommendations: Missing required data, skipping fetch");
      setRecommendations([]);
      return;
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) {
        console.log("useRecommendationsSubscription/fetchRecommendations: No authenticated user");
        setRecommendations([]);
        return;
      }

      // Fetch recommendations for specific date, location, and user
      const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
      const roundedLat = Math.round(lat * 100) / 100;
      const roundedLon = Math.round(lon * 100) / 100;
      
      console.log("useRecommendationsSubscription/fetchRecommendations: rounded coordinates");
      console.log("useRecommendationsSubscription/fetchRecommendations: original lat:", lat, "original lon:", lon);
      console.log("useRecommendationsSubscription/fetchRecommendations: rounded lat:", roundedLat, "rounded lon:", roundedLon);
      console.log("useRecommendationsSubscription/fetchRecommendations: dateString:", dateString);

      
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from("recommendations")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateString)
        .eq("latitude", roundedLat)
        .eq("longitude", roundedLon);

      if (recommendationsError) {
        console.error("useRecommendationsSubscription/fetchRecommendations: ", recommendationsError);
        setRecommendations([]);
        return;
      }

      console.log("useRecommendationsSubscription/fetchRecommendations: ", recommendationsData);  

      // For each recommendation, fetch the associated layers
      const recommendationsWithLayers: RecommendationWithLayers[] = [];
      
      for (const recommendation of recommendationsData || []) {
        if (recommendation.layers && recommendation.layers.length > 0) {
          const { data: layersData, error: layersError } = await supabase
            .from("layer")
            .select("id, name, description, warmth, top, bottom")
            .in("id", recommendation.layers);

          if (layersError) {
            console.error("useRecommendationsSubscription/fetchRecommendations: Error fetching layers for recommendation", recommendation.id, layersError);
            // Continue with other recommendations even if one fails
            continue;
          }

          recommendationsWithLayers.push({
            ...recommendation,
            layerDetails: layersData || []
          });
        } else {
          // Recommendation with no layers
          recommendationsWithLayers.push({
            ...recommendation,
            layerDetails: []
          });
        }
      }

      console.log("useRecommendationsSubscription/fetchRecommendations: ", recommendationsWithLayers);
      setRecommendations(recommendationsWithLayers);
    } catch (err) {
      console.error("useRecommendationsSubscription/fetchRecommendations: Unexpected error", err);
      setRecommendations([]);
    }
  };

  useEffect(() => {
    fetchRecommendations();

    const channel = supabase
      .channel("recommendations-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recommendations" },
        async (payload) => {
          console.log("useRecommendationsSubscription: recommendations table changed", payload);
          await fetchRecommendations();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "layer" },
        async (payload) => {
          console.log("useRecommendationsSubscription: layer table changed", payload);
          // Refresh recommendations when layers change since they contain layer references
          await fetchRecommendations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, lat, lon]);

  return { recommendations, refetch: fetchRecommendations };
} 