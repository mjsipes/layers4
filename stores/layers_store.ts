// /stores/layers_store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Layer = Tables<"layer">;

type LayerState = {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: {
    name: string;
    description?: string;
    warmth?: number;
  }) => Promise<void>;
  deleteLayer: (layerId: string) => Promise<void>;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

let isSubscribed = false;
let channel: any = null;

export const useLayerStore = create<LayerState>()(
  devtools(
    (set) => ({
      layers: [],

      setLayers: (layers) => set({ layers }),

      addLayer: async (layerData) => {
        try {
          /* 1. Get user */
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) console.error("🔴 [LAYERS] Error getting user:", userError);
          else console.log("🟢 [LAYERS] User data:", { id: user?.id });

          /* 2. Insert layer */
          const insertData = {
            name: layerData.name,
            description: layerData.description ?? null,
            warmth: layerData.warmth ?? null,
            user_id: user?.id ?? null,
          };
          console.log("🔵 [LAYERS] Inserting:", insertData);

          const { data, error: insertErr } = await supabase
            .from("layer")
            .insert(insertData)
            .select()
            .single();

          if (insertErr) throw insertErr;
          console.log("🟢 [LAYERS] Layer inserted:", data);
        } catch (err) {
          console.error("🔴 [LAYERS] Failed to add layer:", err);
          throw err;
        }
      },

      deleteLayer: async (layerId) => {
        try {
          console.log("🔵 [LAYERS] Deleting layer:", layerId);

          const { data, error } = await supabase
            .from("layer")
            .delete()
            .eq("id", layerId)
            .select();

          if (error) throw error;
          console.log("🟢 [LAYERS] Deleted:", data);
        } catch (err) {
          console.error("🔴 [LAYERS] Failed to delete layer:", err);
          throw err;
        }
      },
    }),
    { name: "🧩 Layer Store" }
  )
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const fetchLayers = async () => {
  const { data, error } = await supabase.from("layer").select("*");

  if (error) {
    console.error("🔴 [LAYERS] Fetch error:", error);
    useLayerStore.getState().setLayers([]);
    return [];
  }

  console.log("🟢 [LAYERS] Raw data:", data);
  useLayerStore.getState().setLayers(data || []);
  return data || [];
};

/* ------------------------------------------------------------------ */
/* Live-query initialization                                           */
/* ------------------------------------------------------------------ */

const initializeStore = async () => {
  if (isSubscribed) return;

  try {
    await fetchLayers();

    channel = supabase
      .channel("layers-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "layer" },
        async (payload) => {
          console.log("🔵 [LAYERS] Subscription triggered:", payload);
          await fetchLayers();
        }
      )
      .subscribe();

    isSubscribed = true;
  } catch (err) {
    console.error("🔴 [LAYERS] Init error:", err);
    useLayerStore.getState().setLayers([]);
  }
};

initializeStore();

/* ------------------------------------------------------------------ */
/* Cleanup                                                             */
/* ------------------------------------------------------------------ */

export const cleanupLayersStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export type { Layer };
