// /hooks/useWeather.ts
import { useEffect } from 'react';
import { useWeatherStore } from '@/stores/weather_store';

export const useWeather = () => {
  const { setWeatherData } = useWeatherStore();
  const lat = useWeatherStore((state) => state.lat);
  const lon = useWeatherStore((state) => state.lon);
  const date = useWeatherStore((state) => state.date);

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