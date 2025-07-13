// /stores/global_store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";

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
let isUpdatingFromSubscription = false;

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
        setSelectedItem: async (itemId, type) => {
          set({ selectedItemId: itemId, selectedType: type });
          
          // Only push to database if not updating from subscription
          if (!isUpdatingFromSubscription) {
            await push_selected_item_to_db(itemId, type);
          }
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

const push_selected_item_to_db = async (itemId: string | null, type: SelectedItemType) => {
  try {
    /* 1. Get user */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("🔴 [GLOBAL] Error getting user:", userError);
      throw userError;
    }
    console.log("🟢 [GLOBAL] User data:", { id: user?.id });

    /* 2. Update user's profile with selected item */
    if (user?.id) {
      const updateData = {
        selectedItemId: itemId,
        selectedType: type,
      };
      console.log("🔵 [GLOBAL] Updating profile selected item:", updateData);

      const { data: profileData, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.error("🔴 [GLOBAL] Failed to update profile selected item:", updateError);
        throw updateError;
      }
      console.log("🟢 [GLOBAL] Profile selected item updated:", profileData);
    }
  } catch (err) {
    console.error("🔴 [GLOBAL] Failed to push selected item to database:", err);
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

    /* 2. Fetch initial profile data */
    const { data: profileData, error: fetchError } = await supabase
      .from("profiles")
      .select("selectedItemId, selectedType")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("🔴 [GLOBAL] Error fetching profile:", fetchError);
    } else if (profileData) {
      console.log("🟢 [GLOBAL] Profile data loaded:", profileData);
      isUpdatingFromSubscription = true;
      useGlobalStore.getState().setSelectedItem(
        profileData.selectedItemId,
        profileData.selectedType as SelectedItemType
      );
      isUpdatingFromSubscription = false;
    }

    /* 3. Set up subscription */
    channel = supabase
      .channel("global-channel")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "profiles",
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          console.log("🔵 [GLOBAL] Profile change:", payload);
          if (payload.new) {
            const newData = payload.new as any;
            isUpdatingFromSubscription = true;
            useGlobalStore.getState().setSelectedItem(
              newData.selectedItemId,
              newData.selectedType as SelectedItemType
            );
            isUpdatingFromSubscription = false;
          }
        }
      )
      .subscribe();

    isSubscribed = true;
    console.log("🟢 [GLOBAL] Subscription initialized");
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