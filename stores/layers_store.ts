// /stores/layers_store.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Layer type - adjust based on your actual database.types
export type Layer = {
  id: string;
  created_at: string;
  name: string | null;
  description: string | null;
  warmth: number | null;
  user_id: string | null;
};

type LayerState = {
  layers: Layer[];
};

// Global state to track subscription
let isSubscribed = false;
let channel: any = null;

export const useLayerStore = create<LayerState>((set) => ({
  layers: [],
}));

// Auto-initialize the store when first imported
const initializeStore = async () => {
  if (isSubscribed) return;
  
  try {
    // Fetch initial data
    const { data, error } = await supabase.from("layer").select("*");
    
    if (error) {
      console.error("Error fetching layers:", error);
      useLayerStore.setState({ layers: [] });
      return;
    }
    
    useLayerStore.setState({ layers: data || [] });
    
    // Set up real-time subscription
    channel = supabase
      .channel("layers-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "layer",
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          
          if (eventType === "INSERT") {
            useLayerStore.setState((state) => ({ 
              layers: [...state.layers, newRow as Layer] 
            }));
          } else if (eventType === "UPDATE") {
            useLayerStore.setState((state) => ({
              layers: state.layers.map((layer) => 
                layer.id === (newRow as Layer).id ? newRow as Layer : layer
              )
            }));
          } else if (eventType === "DELETE") {
            useLayerStore.setState((state) => ({
              layers: state.layers.filter((layer) => layer.id !== (oldRow as Layer).id)
            }));
          }
        }
      )
      .subscribe();
    
    isSubscribed = true;
    
  } catch (error) {
    console.error("Error initializing layers store:", error);
    useLayerStore.setState({ layers: [] });
  }
};

// Initialize automatically
initializeStore();

// Cleanup function for when the app unmounts (optional)
export const cleanupLayersStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};
