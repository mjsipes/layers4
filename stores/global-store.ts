// /stores/global_store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Import the recommendation types
export interface Recommendation {
  id: number;
  created_at: string;
  date: string | null;
  layers: string[];
  reasoning: string | null;
  user_id: string | null;
}

export interface RecommendationWithLayers extends Recommendation {
  layerDetails: Array<{
    id: string;
    name: string | null;
    description: string | null;
    warmth: number | null;
    top: boolean | null;
    bottom: boolean | null;
  }>;
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type SelectedItemType = "selectlayer" | "selectlog" | "addlayer" | "addlog" | "home";
type ViewMode = "table" | "grid";
type WardrobeTab = "layers" | "logs";

type GlobalState = {
  // Global UI state
  selectedItemId: string | null;
  selectedType: SelectedItemType;
  wardrobeViewMode: ViewMode;
  wardrobeActiveTab: WardrobeTab;
  address: string | null;
  
  // Weather state
  date: Date;
  lat: number | null;
  lon: number | null;
  weatherData: any;
  
  // Recommendations state
  recommendations: RecommendationWithLayers[];
  
  // Actions
  setSelectedItem: (itemId: string | null, type: SelectedItemType) => void;
  setWardrobeViewMode: (mode: ViewMode) => void;
  setWardrobeActiveTab: (tab: WardrobeTab) => void;
  toggleWardrobeViewMode: () => void;
  setDate: (date: Date) => void;
  setLocation: (lat: number, lon: number) => void;
  setWeatherData: (data: any) => void;
  clearWeather: () => void;
  setAddress: (address: string | null) => void;
  setRecommendations: (recommendations: RecommendationWithLayers[]) => void;
  clearRecommendations: () => void;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      (set, get) => ({
        // Global UI state
        selectedItemId: null,
        selectedType: "home",
        wardrobeViewMode: "grid",
        wardrobeActiveTab: "layers",
        address: null,
        
        // Weather state
        date: new Date(),
        lat: null,
        lon: null,
        weatherData: null,
        
        // Recommendations state
        recommendations: [],
        
        // Global UI actions
        setSelectedItem: (itemId, type) => {
          set({ selectedItemId: itemId, selectedType: type });
        },
        setWardrobeViewMode: (mode) =>
          set({ wardrobeViewMode: mode }),
        setWardrobeActiveTab: (tab) =>
          set({ wardrobeActiveTab: tab }),
        toggleWardrobeViewMode: () =>
          set((state) => ({
            wardrobeViewMode: state.wardrobeViewMode === "table" ? "grid" : "table",
          })),
        
        // Weather actions
        setDate: (date) => set({ date }),
        setLocation: (lat, lon) => {
          set({ lat, lon });
        },
        setWeatherData: (data) => set({ weatherData: data }),
        clearWeather: () => set({ weatherData: null }),
        setAddress: (address) => set({ address }),
        
        // Recommendations actions
        setRecommendations: (recommendations) => set({ recommendations }),
        clearRecommendations: () => set({ recommendations: [] }),
      }),
      {
        name: 'layers-global-state', // localStorage key
        partialize: (state) => ({
          // Only persist these specific fields
          wardrobeViewMode: state.wardrobeViewMode,
          wardrobeActiveTab: state.wardrobeActiveTab,
        }),
      }
    ),
    { name: 'global-store' }
  )
); 