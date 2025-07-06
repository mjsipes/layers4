// /hooks/useWeather.ts
import { useEffect } from 'react';
import { useWeatherStore, useLocationStore, useTimeStore } from '@/stores/weather_store';

export const useWeather = () => {
  const { setWeatherData } = useWeatherStore();
  const lat = useLocationStore((state) => state.lat);
  const lon = useLocationStore((state) => state.lon);
  const date = useTimeStore((state) => state.date);

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