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
};

// Global state to track subscription
let isSubscribed = false;
let channel: any = null;

export const useOutfitStore = create<OutfitState>((set) => ({
  outfits: [],
}));

// Helper function to fetch outfits with layers
const fetchOutfits = async () => {
  const { data, error } = await supabase
    .from("outfit")
    .select(`
      *,
      outfit_layer(
        layer(*)
      )
    `);
  
  if (error) {
    console.error("Error fetching outfits:", error);
    return [];
  }

  const outfitsWithLayers = data?.map(outfit => ({
    ...outfit,
    layers: outfit.outfit_layer?.map((ol: any) => ol.layer) || []
  })) || [];

  return outfitsWithLayers as Outfit[];
};

// Helper function to fetch specific outfits by IDs
const _fetchOutfitsById = async (ids: string[]) => {
  if (!ids || ids.length === 0) return [];
  
  const { data, error } = await supabase
    .from("outfit")
    .select(`
      *,
      outfit_layer(
        layer(*)
      )
    `)
    .in('id', ids);
  
  if (error) {
    console.error("Error fetching outfits by ID:", error);
    return [];
  }

  const outfitsWithLayers = data?.map(outfit => ({
    ...outfit,
    layers: outfit.outfit_layer?.map((ol: any) => ol.layer) || []
  })) || [];

  return outfitsWithLayers as Outfit[];
};

// Auto-initialize the store when first imported
const initializeStore = async () => {
  if (isSubscribed) return;
  
  try {
    // Fetch initial data
    const outfits = await fetchOutfits();
    useOutfitStore.setState({ outfits });
    
    // Set up real-time subscription for outfit changes
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
          // Refetch all outfits when there's any change to maintain consistency
          const outfits = await fetchOutfits();
          useOutfitStore.setState({ outfits });
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
          // Refetch all outfits when outfit_layer changes
          const outfits = await fetchOutfits();
          useOutfitStore.setState({ outfits });
        }
      )
      .subscribe();
    
    isSubscribed = true;
    
  } catch (error) {
    console.error("Error initializing outfits store:", error);
    useOutfitStore.setState({ outfits: [] });
  }
};

// Initialize automatically
initializeStore();

// Cleanup function for when the app unmounts (optional)
export const cleanupOutfitsStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};

// Export the fetch function for external use
export const fetchOutfitsById = _fetchOutfitsById;

export type { Outfit };
