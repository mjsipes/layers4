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

export type { Layer };
