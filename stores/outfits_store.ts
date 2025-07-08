// /stores/outfits_store.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/supabase/database.types';

const supabase = createClient();

type Outfit = Tables<'outfit'> & {
  layers: Tables<'layer'>[];
};

type OutfitState = {
  outfits: Outfit[];
  addOutfit: (outfit: { 
    name: string; 
    layer_ids?: string[]; 
  }) => Promise<void>;
};

let isSubscribed = false;
let channel: any = null;

export const useOutfitStore = create<OutfitState>((set) => ({
  outfits: [],
  addOutfit: async (outfitData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("🔴 [OUTFITS] Error getting user:", userError);
      } else {
        console.log("🟢 [OUTFITS] User data received:", { id: user?.id });
      }
      const insertData = {
        name: outfitData.name,
        user_id: user?.id || null,
      };
      console.log("🔵 [OUTFITS] Inserting outfit data:", insertData);
      const { data: newOutfit, error: outfitError } = await supabase
        .from("outfit")
        .insert(insertData)
        .select()
        .single();
      if (outfitError) {
        console.error("🔴 [OUTFITS] Error adding outfit:", outfitError);
        throw outfitError;
      } else {
        console.log("🟢 [OUTFITS] Outfit inserted successfully:", newOutfit);
      }
      if (outfitData.layer_ids && outfitData.layer_ids.length > 0 && newOutfit) {
        const outfitLayers = outfitData.layer_ids.map(layerId => ({
          outfit_id: newOutfit.id,
          layer_id: layerId,
        }));
        console.log("🔵 [OUTFITS] Inserting outfit-layer relationships:", outfitLayers);
        const { error: relationError } = await supabase
          .from("outfit_layer")
          .insert(outfitLayers);
        if (relationError) {
          console.error("🔴 [OUTFITS] Error adding outfit-layer relations:", relationError);
          throw relationError;
        } else {
          console.log("🟢 [OUTFITS] Outfit-layer relationships added successfully");
        }
      }
    } catch (error) {
      console.error("🔴 [OUTFITS] Failed to add outfit:", error);
      throw error;
    }
  },
}));

export const fetchOutfits = async () => {
  const { data, error } = await supabase
    .from("outfit")
    .select(`
      *,
      outfit_layer(
        layer(*)
      )
    `);
  if (error) {
    console.error("🔴 [OUTFITS] Error fetching outfits:", error);
    useOutfitStore.setState({ outfits: [] });
    return [];
  }
  console.log("🟢 [OUTFITS] Raw data received:", data);
  const outfitsWithLayers = data?.map(outfit => ({
    ...outfit,
    layers: outfit.outfit_layer?.map((ol: any) => ol.layer) || []
  })) || [];
  useOutfitStore.setState({ outfits: outfitsWithLayers });
  return outfitsWithLayers;
};

const initializeStore = async () => {
  if (isSubscribed) {
    return;
  }
  try {
    // Fetch initial data
    await fetchOutfits();
    channel = supabase
      .channel("outfits-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "outfit",
        },
        async (payload) => {
          console.log("🔵 [OUTFITS] Subscription triggered (outfit):", payload);
          await fetchOutfits();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "outfit_layer",
        },
        async (payload) => {
          console.log("🔵 [OUTFITS] Subscription triggered (outfit_layer):", payload);
          await fetchOutfits();
        }
      )
      .subscribe();
    isSubscribed = true;
  } catch (error) {
    console.error("🔴 [OUTFITS] Error initializing outfits store:", error);
    useOutfitStore.setState({ outfits: [] });
  }
};

initializeStore();

export const cleanupOutfitsStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};


export type { Outfit };
