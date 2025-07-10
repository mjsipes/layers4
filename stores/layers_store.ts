// /stores/layers_store.ts
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { devtools } from "zustand/middleware";


const supabase = createClient();

type Layer = Tables<"layer">;

type LayerState = {
  layers: Layer[];
  addLayer: (layer: {
    name: string;
    description?: string;
    warmth?: number;
  }) => Promise<void>;
  deleteLayer: (layerId: string) => Promise<void>;
};

let isSubscribed = false;
let channel: any = null;

export const useLayerStore = create<LayerState>()(
  devtools((set, get) => ({
  layers: [],
  addLayer: async (layerData) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("🔴 [LAYERS] Error getting user:", userError);
      } else {
        console.log("🟢 [LAYERS] User data received:", { id: user?.id });
      }
      const insertData = {
        name: layerData.name,
        description: layerData.description || null,
        warmth: layerData.warmth || null,
        user_id: user?.id || null,
      };
      console.log("🔵 [LAYERS] Inserting layer data:", insertData);
      const { data, error } = await supabase
        .from("layer")
        .insert(insertData)
        .select()
        .single();
      if (error) {
        console.error("🔴 [LAYERS] Error inserting layer:", error);
        throw error;
      } else {
        console.log("🟢 [LAYERS] Layer inserted successfully:", data);
      }
    } catch (error) {
      console.error("🔴 [LAYERS] Failed to add layer:", error);
      throw error;
    }
  },
  deleteLayer: async (layerId) => {
    try {
      console.log("🔵 [LAYERS] Deleting layer with ID:", layerId);
      const { data, error } = await supabase
        .from("layer")
        .delete()
        .eq("id", layerId)
        .select();
      
      console.log("🟢 [LAYERS] Delete result data:", data);
      console.log("🟢 [LAYERS] Delete result error:", error);
      
      if (error) {
        console.error("🔴 [LAYERS] Error deleting layer:", error);
        throw error;
      } else {
        console.log("🟢 [LAYERS] Layer deleted successfully:", data);
      }
    } catch (error) {
      console.error("🔴 [LAYERS] Failed to delete layer:", error);
      throw error;
    }
  },
  }), { name: '🧩 Layer Store' })
);


export const fetchLayers = async () => {
  const { data, error } = await supabase.from("layer").select("*");
  if (error) {
    console.error("🔴 [LAYERS] Error fetching layers:", error);
    useLayerStore.setState({ layers: [] });
    return [];
  }
  console.log("🟢 [LAYERS] Raw data received:", data);
  useLayerStore.setState({ layers: data || [] });
  return data || [];
};

const initializeStore = async () => {
  if (isSubscribed) {
    return;
  }
  try {
    await fetchLayers();
    channel = supabase.channel("layers-channel");
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "layer",
      },
      async (payload: any) => {
        console.log("🔵 [LAYERS] Subscription triggered:", payload);
        await fetchLayers();
      }
    );
    channel.subscribe();
    isSubscribed = true;
  } catch (error) {
    console.error("🔴 [LAYERS] Error initializing layers store:", error);
    useLayerStore.setState({ layers: [] });
  }
};

initializeStore();

export const cleanupLayersStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};

export type { Layer };
