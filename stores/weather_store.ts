// /stores/weather_store.ts
import { create } from 'zustand';

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
