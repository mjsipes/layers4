import { useEffect } from "react";
import { useLayerStore } from "@/stores/layers_store";
import { createClient } from "@/lib/supabase/client";
import { useGlobalStore } from "@/stores/global_store";

const supabase = createClient();

export function useLayersSubscription() {
  const setLayers = useLayerStore((state) => state.setLayers);
  const setSelectedItem = useGlobalStore((state) => state.setSelectedItem);
  const setWardrobeActiveTab = useGlobalStore((state) => state.setWardrobeActiveTab);
  // Fetch all layers and update the store
  const fetchLayers = async () => {
    console.log("useLayersSubscription/fetchLayers: Fetching layers");
    const { data, error } = await supabase
      .from("layer")
      .select("*")
      .order("name", { ascending: true });
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
        async (payload) => {
          console.log("useLayersSubscription: layer table changed", payload);
          await fetchLayers();
          if (
            payload?.eventType === "INSERT" ||
            payload?.eventType === "UPDATE"
          ) {
            const newLayerId = payload?.new?.id;
            if (newLayerId) {
              setSelectedItem(newLayerId, "selectlayer");
              setWardrobeActiveTab("layers");
            }
          } else if (payload?.eventType === "DELETE") {
            const layers = useLayerStore.getState().layers;
            if (layers.length > 0) {
              setSelectedItem(layers[layers.length - 1].id, "selectlayer");
            } else {
              setSelectedItem(null, "selectlayer");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
} 