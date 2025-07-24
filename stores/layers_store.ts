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
  updateLayer?: (layerId: string, updates: Partial<Omit<Layer, 'id'>>) => Promise<void>;
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
          if (userError) console.error("layers-store/addLayer: Error getting user:", userError);
          else console.log("layers-store/addLayer: User data:", { id: user?.id });

          /* 2. Insert layer */
          const insertData = {
            name: layerData.name,
            description: layerData.description ?? null,
            warmth: layerData.warmth ?? null,
            user_id: user?.id ?? null,
          };
          console.log("layers-store/addLayer: Inserting:", insertData);

          const { data, error: insertErr } = await supabase
            .from("layer")
            .insert(insertData)
            .select()
            .single();

          if (insertErr) throw insertErr;
          console.log("layers-store/addLayer: Layer inserted:", data);
        } catch (err) {
          console.error("layers-store/addLayer: Failed to add layer:", err);
          throw err;
        }
      },

      deleteLayer: async (layerId) => {
        try {
          console.log("layers-store/deleteLayer: Deleting layer:", layerId);

          const { data, error } = await supabase
            .from("layer")
            .delete()
            .eq("id", layerId)
            .select();

          if (error) throw error;
          console.log("layers-store/deleteLayer: Deleted:", data);
        } catch (err) {
          console.error("layers-store/deleteLayer: Failed to delete layer:", err);
          throw err;
        }
      },

      updateLayer: async (layerId, updates) => {
        try {
          console.log("layers-store/updateLayer: Updating layer:", layerId, updates);
          const { data, error } = await supabase
            .from("layer")
            .update(updates)
            .eq("id", layerId)
            .select()
            .single();
          if (error) throw error;
          set((state) => ({
            layers: state.layers.map((layer) =>
              layer.id === layerId ? { ...layer, ...updates } : layer
            ),
          }));
          console.log("layers-store/updateLayer: Updated:", data);
        } catch (err) {
          console.error("layers-store/updateLayer: Failed to update layer:", err);
          throw err;
        }
      },
    }),
    { name: "layers-store" }
  )
);

export type { Layer };
