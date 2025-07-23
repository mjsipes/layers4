import { useEffect } from "react";
import { useOutfitStore } from "@/stores/outfits_store";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useOutfitsSubscription() {
  const setOutfits = useOutfitStore((state) => state.setOutfits);

  // Fetch all outfits and update the store
  const fetchOutfits = async () => {
    console.log("🔵 [OUTFITS] Fetching outfits (initial)");
    const { data, error } = await supabase
      .from("outfit")
      .select(
        `
        *,
        outfit_layer(
          layer:layer(*)
        )
      `
      );

    if (error) {
      console.error("🔴 [OUTFITS] Fetch error:", error);
      setOutfits([]);
      return [];
    }

    console.log("🟢 [OUTFITS] Raw data:", data);

    const outfitsWithLayers =
      data?.map((o: any) => ({
        ...o,
        layers: o.outfit_layer?.map((ol: any) => ol.layer) ?? [],
      })) ?? [];

    setOutfits(outfitsWithLayers);
    return outfitsWithLayers;
  };

  useEffect(() => {
    fetchOutfits();

    const outfitChannel = supabase
      .channel("outfit-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outfit" },
        async () => {
          console.log("🔵 [OUTFITS] outfit table subscription triggered");
          await fetchOutfits();
        }
      )
      .subscribe();

    const outfitLayerChannel = supabase
      .channel("outfit-layer-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outfit_layer" },
        async () => {
          console.log("🔵 [OUTFITS] outfit_layer table subscription triggered");
          await fetchOutfits();
        }
      )
      .subscribe();

    return () => {
      console.log("🟡 [OUTFITS] Removing outfit and outfit_layer channels");
      supabase.removeChannel(outfitChannel);
      supabase.removeChannel(outfitLayerChannel);
    };
  }, []);
} 