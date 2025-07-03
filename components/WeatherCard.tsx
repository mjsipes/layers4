"use client";
import React, { useEffect, useState } from "react";
import { useBearStore, useTimeStore } from "@/stores/store";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocationStore } from "@/stores/store";

const WeatherCard = () => {
  const bears = useBearStore((state) => state.bears);
  const date = useTimeStore((state) => state.date);
  const [currentTime, setCurrentTime] = useState(new Date());

  useGeolocation(); // Set location on mount

  const lat = useLocationStore((state) => state.lat);
  const lon = useLocationStore((state) => state.lon);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Call API when lat/lon/date are ready
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
            date: date.toISOString().split("T")[0], // Format: YYYY-MM-DD
          }),
        });

        const data = await res.json();
        console.log("Weather API result:", data);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    };

    fetchWeather();
  }, [lat, lon, date]);

  return (
    <div className="text-center space-y-2 border-b w-full p-4">
      <p>
        {date.toDateString()} {currentTime.toLocaleTimeString()}
      </p>
      <div>
        {lat && lon ? (
          <p>
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </p>
        ) : (
          <p>Getting your location...</p>
        )}
      </div>
      <h1>{bears} bears around here ...</h1>
    </div>
  );
};

export default WeatherCard;
