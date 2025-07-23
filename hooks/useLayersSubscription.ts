import { useEffect } from "react";
import { useLayerStore } from "@/stores/layers_store";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useLayersSubscription() {
  const setLayers = useLayerStore((state) => state.setLayers);

  // Fetch all layers and update the store
  const fetchLayers = async () => {
    console.log("useLayersSubscription/fetchLayers: Fetching layers");
    const { data, error } = await supabase.from("layer").select("*");
    if (error) {
      console.error("useLayersSubscription/fetchLayers: ", error);
      setLayers([]);
      return [];
    }
    console.log("useLayersSubscription/fetchLayers: ", data);
    setLayers(data || []);
    return data || [];
  };

  useEffect(() => {
    fetchLayers();

    const channel = supabase
      .channel("layers-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "layer" },
        async () => {
          console.log("useLayersSubscription: Subscription triggered");
          await fetchLayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
} 