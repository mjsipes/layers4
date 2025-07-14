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
  setLocation: (lat: number, lon: number) => void;
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

/* ------------------------------------------------------------------ */
/* Live-query initialization                                           */
/* ------------------------------------------------------------------ */

const initializeStore = async () => {
  if (isSubscribed) return;

  try {
    /* 1. Get user for private channel */
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

    /* 2. Set up bidirectional private channel */
    const channelName = `ui-updates-${user.id}`;
    channel = supabase
      .channel(channelName)
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
          supabase.channel(channelName).send({
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
      .on(
        "broadcast",
        { event: "set-location" },
        (payload) => {
          console.log("🔵 [GLOBAL] Received location update:", payload);
          const { lat, lon } = payload.payload || {};
          useGlobalStore.getState().setLocation(lat, lon);
        }
      )
      .on(
        "broadcast",
        { event: "get-current-location" },
        (payload) => {
          console.log("🔵 [GLOBAL] Received location state request:", payload);
          const currentState = useGlobalStore.getState();
          
          // Send current location back
          supabase.channel(channelName).send({
            type: "broadcast",
            event: "location-state-response",
            payload: {
              requestId: payload.payload?.requestId,
              lat: currentState.lat,
              lon: currentState.lon,
            },
          });
        }
      )
      .subscribe();

    isSubscribed = true;
    console.log("🟢 [GLOBAL] Private UI updates channel initialized:", channelName);
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