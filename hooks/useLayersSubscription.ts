import { useEffect } from "react";
import { useLayerStore } from "@/stores/layers_store";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useLayersSubscription() {
  const setLayers = useLayerStore((state) => state.setLayers);

  // Fetch all layers and update the store
  const fetchLayers = async () => {
    const { data, error } = await supabase.from("layer").select("*");
    if (error) {
      console.error("🔴 [LAYERS] Fetch error:", error);
      setLayers([]);
      return [];
    }
    console.log("🔴 [LAYERS] Fetch success:", data);
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
          console.log("🔴 [LAYERS] Subscription triggered");
          await fetchLayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
} 