// /stores/global_store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type SelectedItemType = "selectlayer" | "selectlog" | "addlayer" | "addlog" | "recommendations";
type ViewMode = "table" | "grid";
type WardrobeTab = "layers" | "logs";

type GlobalState = {
  // Global UI state
  selectedItemId: string | null;
  selectedType: SelectedItemType;
  wardrobeViewMode: ViewMode;
  wardrobeActiveTab: WardrobeTab;
  
  // Weather state
  date: Date;
  lat: number | null;
  lon: number | null;
  weatherData: any;
  
  // Actions
  setSelectedItem: (itemId: string | null, type: SelectedItemType) => void;
  setWardrobeViewMode: (mode: ViewMode) => void;
  setWardrobeActiveTab: (tab: WardrobeTab) => void;
  toggleWardrobeViewMode: () => void;
  setDate: (date: Date) => void;
  setLocation: (lat: number, lon: number) => void;
  setWeatherData: (data: any) => void;
  clearWeather: () => void;
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
        selectedType: "addlog",
        wardrobeViewMode: "grid",
        wardrobeActiveTab: "layers",
        
        // Weather state
        date: new Date(),
        lat: null,
        lon: null,
        weatherData: null,
        
        // Global UI actions
        setSelectedItem: (itemId, type) => {
          console.log("🔵 [GLOBAL] Setting selected item:", { itemId, type });
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
    { name: '🌐 Global Store' }
  )
); 