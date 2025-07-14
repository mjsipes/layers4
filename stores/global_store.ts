// /stores/global_store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type SelectedItemType = "selectlayer" | "selectoutfit" | "selectlog" | "addlayer" | "addoutfit" | "addlog" | "recommendations";
type ViewMode = "table" | "grid";
type WardrobeTab = "layers" | "outfits" | "logs";

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
  setLocation: (lat: number, lon: number) => Promise<void>;
  setWeatherData: (data: any) => void;
  clearWeather: () => void;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

let isSubscribed = false;
let channel: any = null;

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
        setLocation: async (lat, lon) => {
          set({ lat, lon });
          await push_lat_lon_to_db(lat, lon);
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

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const push_lat_lon_to_db = async (lat: number, lon: number) => {
  try {
    /* 1. Get user */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("🔴 [WEATHER] Error getting user:", userError);
      throw userError;
    }
    console.log("🟢 [WEATHER] User data:", { id: user?.id });

    /* 2. Update user's profile with location */
    if (user?.id) {
      const updateData = {
        latitude: lat,
        longitude: lon,
      };
      console.log("🔵 [WEATHER] Updating profile location:", updateData);

      const { data: profileData, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.error("🔴 [WEATHER] Failed to update profile location:", updateError);
        throw updateError;
      }
      console.log("🟢 [WEATHER] Profile location updated:", profileData);
    }
  } catch (err) {
    console.error("🔴 [WEATHER] Failed to push location to database:", err);
    throw err;
  }
};

/* ------------------------------------------------------------------ */
/* Live-query initialization                                           */
/* ------------------------------------------------------------------ */

const initializeStore = async () => {
  if (isSubscribed) return;

  try {
    /* 1. Get user */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("🔴 [GLOBAL] Error getting user:", userError);
      return;
    }

    if (!user?.id) {
      console.log("🔵 [GLOBAL] No authenticated user, skipping subscription");
      return;
    }

    /* 2. Set up bidirectional channel */
    channel = supabase
      .channel("ui-updates")
      .on(
        "broadcast",
        { event: "display-item" },
        (payload) => {
          console.log("🔵 [GLOBAL] Received display command:", payload);
          console.log("🔵 [GLOBAL] Payload details:", {
            selectedItemId: payload.payload?.selectedItemId,
            selectedType: payload.payload?.selectedType,
            payloadType: typeof payload.payload?.selectedType
          });
          const { selectedItemId, selectedType } = payload.payload || {};
          useGlobalStore.getState().setSelectedItem(selectedItemId, selectedType);
        }
      )
      .on(
        "broadcast",
        { event: "get-current-ui" },
        (payload) => {
          console.log("🔵 [GLOBAL] Received UI state request:", payload);
          const currentState = useGlobalStore.getState();
          
          // Send current state back
          supabase.channel("ui-updates").send({
            type: "broadcast",
            event: "ui-state-response",
            payload: {
              requestId: payload.payload?.requestId,
              selectedItemId: currentState.selectedItemId,
              selectedType: currentState.selectedType,
            },
          });
        }
      )
      .subscribe();

    isSubscribed = true;
    console.log("🟢 [GLOBAL] UI updates channel initialized");
  } catch (err) {
    console.error("🔴 [GLOBAL] Init error:", err);
  }
};

initializeStore();

/* ------------------------------------------------------------------ */
/* Cleanup                                                             */
/* ------------------------------------------------------------------ */

export const cleanupGlobalStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
}; 