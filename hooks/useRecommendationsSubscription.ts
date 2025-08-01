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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch recommendations with their associated layers
  const fetchRecommendations = async () => {
    console.log("useRecommendationsSubscription/fetchRecommendations: Fetching recommendations");
    setLoading(true);
    setError(null);

    try {
      // First, fetch all recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false });

      if (recommendationsError) {
        console.error("useRecommendationsSubscription/fetchRecommendations: ", recommendationsError);
        setError("Failed to fetch recommendations");
        setRecommendations([]);
        return;
      }

      if (!recommendationsData || recommendationsData.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // For each recommendation, fetch the associated layers
      const recommendationsWithLayers: RecommendationWithLayers[] = [];
      
      for (const recommendation of recommendationsData) {
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
      setError("An unexpected error occurred");
      setRecommendations([]);
    } finally {
      setLoading(false);
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
  }, []);

  return { recommendations, loading, error, refetch: fetchRecommendations };
} 