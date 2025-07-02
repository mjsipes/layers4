"use client";
import React, { useEffect, useState } from "react";
import { useBearStore, useTimeStore } from "@/stores/store";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocationStore } from "@/stores/store";

const WeatherCard = () => {
  const bears = useBearStore((state) => state.bears);
  const date = useTimeStore((state) => state.date);
  const [currentTime, setCurrentTime] = useState(new Date());

  useGeolocation(); // Will set the location when component mounts

  const lat = useLocationStore((state) => state.lat);
  const lon = useLocationStore((state) => state.lon);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
