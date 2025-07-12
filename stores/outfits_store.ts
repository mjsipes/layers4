// /stores/outfits_store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Outfit = Tables<"outfit"> & {
  layers: Tables<"layer">[];
};

type OutfitState = {
  outfits: Outfit[];
  setOutfits: (outfits: Outfit[]) => void;
  addOutfit: (outfit: {
    name: string;
    layer_ids?: string[];
  }) => Promise<void>;
  deleteOutfit: (outfitId: string) => Promise<void>;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

let isSubscribed = false;
let channel: any = null;

export const useOutfitStore = create<OutfitState>()(
  devtools(
    (set) => ({
      outfits: [],

      setOutfits: (outfits) => set({ outfits }),

      addOutfit: async (outfitData) => {
        try {
          /* 1. Get user */
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) console.error("🔴 [OUTFITS] Error getting user:", userError);
          else console.log("🟢 [OUTFITS] User data:", { id: user?.id });

          /* 2. Insert outfit */
          const insertData = {
            name: outfitData.name,
            user_id: user?.id ?? null,
          };
          console.log("🔵 [OUTFITS] Inserting:", insertData);

          const { data: newOutfit, error: insertErr } = await supabase
            .from("outfit")
            .insert(insertData)
            .select()
            .single();

          if (insertErr) throw insertErr;
          console.log("🟢 [OUTFITS] Outfit inserted:", newOutfit);

          /* 3. Insert outfit-layer relations (if any) */
          if (outfitData.layer_ids?.length && newOutfit) {
            const relations = outfitData.layer_ids.map((layerId) => ({
              outfit_id: newOutfit.id,
              layer_id: layerId,
            }));
            console.log("🔵 [OUTFITS] Inserting relations:", relations);

            const { error: relErr } = await supabase
              .from("outfit_layer")
              .insert(relations);

            if (relErr) throw relErr;
            console.log("🟢 [OUTFITS] Relations inserted");
          }
        } catch (err) {
          console.error("🔴 [OUTFITS] Failed to add outfit:", err);
          throw err;
        }
      },

      deleteOutfit: async (outfitId) => {
        try {
          console.log("🔵 [OUTFITS] Deleting outfit:", outfitId);

          const { data, error } = await supabase
            .from("outfit")
            .delete()
            .eq("id", outfitId)
            .select();

          if (error) throw error;
          console.log("🟢 [OUTFITS] Deleted:", data);
        } catch (err) {
          console.error("🔴 [OUTFITS] Failed to delete outfit:", err);
          throw err;
        }
      },
    }),
    { name: "🧵 Outfit Store" }
  )
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const fetchOutfits = async () => {
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
    useOutfitStore.getState().setOutfits([]);
    return [];
  }

  console.log("🟢 [OUTFITS] Raw data:", data);

  const outfitsWithLayers: Outfit[] =
    data?.map((o: any) => ({
      ...o,
      layers: o.outfit_layer?.map((ol: any) => ol.layer) ?? [],
    })) ?? [];

  useOutfitStore.getState().setOutfits(outfitsWithLayers);
  return outfitsWithLayers;
};

/* ------------------------------------------------------------------ */
/* Live-query initialization                                           */
/* ------------------------------------------------------------------ */

const initializeStore = async () => {
  if (isSubscribed) return;

  try {
    await fetchOutfits();

    channel = supabase
      .channel("outfits-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outfit" },
        async (payload) => {
          console.log("🔵 [OUTFITS] outfit change:", payload);
          await fetchOutfits();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outfit_layer" },
        async (payload) => {
          console.log("🔵 [OUTFITS] outfit_layer change:", payload);
          await fetchOutfits();
        }
      )
      .subscribe();

    isSubscribed = true;
  } catch (err) {
    console.error("🔴 [OUTFITS] Init error:", err);
    useOutfitStore.getState().setOutfits([]);
  }
};

initializeStore();

/* ------------------------------------------------------------------ */
/* Cleanup                                                             */
/* ------------------------------------------------------------------ */

export const cleanupOutfitsStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export type { Outfit };
