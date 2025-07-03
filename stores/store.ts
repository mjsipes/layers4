// /stores/store.ts
import { create } from 'zustand';
import {createClient} from '@/lib/supabase/client';

const supabase = createClient();

type BearState = {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
};

type TimeState = {
  date: Date;
  setDate: (date: Date) => void;
};

type LocationState = {
  lat: number | null;
  lon: number | null;
  setLocation: (lat: number, lon: number) => void;
};

type WeatherState = {
  data: any;
  setWeatherData: (data: any) => void;
  clearWeather: () => void;
};

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
  isSubscribed: boolean;
  
  // State operations
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  
  // Data management
  fetchLayers: () => Promise<void>;
  subscribeToLayers: (setFocused?: (item: Layer) => void) => () => void;
};

export const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));

export const useTimeStore = create<TimeState>((set) => ({
  date: new Date(),
  setDate: (date) => set({ date }),
}));

export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lon: null,
  setLocation: (lat, lon) => set({ lat, lon }),
}));

export const useWeatherStore = create<WeatherState>((set) => ({
  data: null,
  setWeatherData: (data) => set({ data }),
  clearWeather: () => set({ data: null }),
}));

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: [],
  isSubscribed: false,
  
  setLayers: (layers) => set({ layers }),
  
  addLayer: (layer) => set((state) => ({ 
    layers: [...state.layers, layer] 
  })),
  
  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map((layer) => 
      layer.id === id ? { ...layer, ...updates } : layer
    )
  })),
  
  deleteLayer: (id) => set((state) => ({
    layers: state.layers.filter((layer) => layer.id !== id)
  })),
  
  fetchLayers: async () => {
    const { data, error } = await supabase.from("layer").select("*");
    if (error) {
      console.log("error fetching layers: ", error);
      set({ layers: [] });
      return;
    }
    set({ layers: data || [] });
  },
  
  subscribeToLayers: (setFocused?: (item: Layer) => void) => {
    if (get().isSubscribed) {
      return () => {}; // Already subscribed
    }
    
    const channel = supabase
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
          const { addLayer, updateLayer, deleteLayer } = get();
          
          if (eventType === "INSERT") {
            setFocused?.(newRow as Layer);
            addLayer(newRow as Layer);
          } else if (eventType === "UPDATE") {
            setFocused?.(newRow as Layer);
            updateLayer((newRow as Layer).id, newRow as Layer);
          } else if (eventType === "DELETE") {
            deleteLayer((oldRow as Layer).id);
          }
        }
      )
      .subscribe();
    
    set({ isSubscribed: true });
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
      set({ isSubscribed: false });
    };
  }
}));