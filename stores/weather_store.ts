// /stores/weather_store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type WeatherState = {
  date: Date;
  lat: number | null;
  lon: number | null;
  data: any;
  setDate: (date: Date) => void;
  setLocation: (lat: number, lon: number) => void;
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
      setLocation: (lat, lon) => set({ lat, lon }),
      setWeatherData: (data) => set({ data }),
      clearWeather: () => set({ data: null }),
    }),
    { name: "🌤️ Weather Store" }
  )
);
