// /stores/store.ts
import { create } from 'zustand';

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
