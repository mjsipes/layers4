// /hooks/useWeather.ts
import { useEffect } from 'react';
import { useGlobalStore } from '@/stores/global_store';

export const useWeather = () => {
  const { setWeatherData } = useGlobalStore();
  const lat = useGlobalStore((state) => state.lat);
  const lon = useGlobalStore((state) => state.lon);
  const date = useGlobalStore((state) => state.date);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!lat || !lon || !date) return;

      try {
        const res = await fetch("/api/weather", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: lat,
            longitude: lon,
            date: date.toISOString().split("T")[0],
          }),
        });

        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    };

    fetchWeather();
  }, [lat, lon, date, setWeatherData]);
};