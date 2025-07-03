"use client";
import React, { useEffect, useState } from "react";
import { useBearStore, useTimeStore, useLocationStore, useWeatherStore } from "@/stores/store";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";

const WeatherCard = () => {
  const bears = useBearStore((state) => state.bears);
  const date = useTimeStore((state) => state.date);
  const [currentTime, setCurrentTime] = useState(new Date());

  useGeolocation();
  useWeather();

  const lat = useLocationStore((state) => state.lat);
  const lon = useLocationStore((state) => state.lon);
  const { data: weatherData } = useWeatherStore();
  
  useEffect(()=>{
    console.log("Weather Data:",weatherData)
  },[weatherData])

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
      
      {weatherData && (
        <div>
          <p>Weather data loaded!</p>
          <pre>{JSON.stringify(weatherData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;