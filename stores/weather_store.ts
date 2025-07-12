// /stores/weather_store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type WeatherState = {
  date: Date;
  lat: number | null;
  lon: number | null;
  data: any;
  setDate: (date: Date) => void;
  setLocation: (lat: number, lon: number) => Promise<void>;
  setWeatherData: (data: any) => void;
  clearWeather: () => void;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const useWeatherStore = create<WeatherState>()(
  devtools(
    (set) => ({
      date: new Date(),
      lat: null,
      lon: null,
      data: null,
      setDate: (date) => set({ date }),
      setLocation: async (lat, lon) => {
        set({ lat, lon });
        await push_lat_lon_to_db(lat, lon);
      },
      setWeatherData: (data) => set({ data }),
      clearWeather: () => set({ data: null }),
    }),
    { name: "🌤️ Weather Store" }
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
