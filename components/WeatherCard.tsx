"use client";
import React, { useEffect, useState } from "react";
import {
  useTimeStore,
  useLocationStore,
  useWeatherStore,
} from "@/stores/weather_store";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";

const WeatherCard = () => {
  const date = useTimeStore((state) => state.date);
  const [currentTime, setCurrentTime] = useState(new Date());

  useGeolocation();
  useWeather();

  const lat = useLocationStore((state) => state.lat);
  const lon = useLocationStore((state) => state.lon);
  const { data: weatherData } = useWeatherStore();

  useEffect(() => {
    console.log("Weather Data:", weatherData);
  }, [weatherData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!weatherData) {
    return (
      <div className="w-full h-[250px] border-b flex items-center justify-center">
        <p className="text-muted-foreground">Loading weather data...</p>
      </div>
    );
  }

  const currentWeather = weatherData.days?.[0];

  return (
    <div className="w-full h-[250px] border-b flex flex-col p-6 gap-4">
      {/* Top Weather Info Section */}
      <div className="flex-1 flex flex-row justify-between gap-6">
        {/* Temperature Column */}
        <div className="flex flex-col justify-start">
          <div className="flex items-baseline gap-2">
            <h1 className="text-8xl font-extrabold tracking-tight text-primary leading-none">
              {currentWeather?.temp || "--"}
            </h1>
            <span className="text-3xl font-bold text-primary/70">°</span>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="badge">L: {currentWeather?.tempmin || "--"}°</span>
            <span className="badge">H: {currentWeather?.tempmax || "--"}°</span>
          </div>
        </div>
        {/* Right Group: Weather Stats + Location/Time */}
        <div className="flex flex-row gap-10 justify-end w-full max-w-[600px]">
          {/* Weather Stats Column */}
          <div className="flex flex-col justify-start gap-2 flex-1 min-w-[120px]">
            <span className="badge">
              Wind: {currentWeather?.windspeed || "--"} mph
            </span>
            <span className="badge">
              UV Index: {currentWeather?.uvindex || "--"}
            </span>
            <span className="badge">
              Precip: {currentWeather?.precip || "0"}%
            </span>
            <span className="badge">
              Humidity: {currentWeather?.humidity || "--"}%
            </span>
          </div>

          {/* Location & Time Column */}
          <div className="flex flex-col justify-start gap-2 flex-1 min-w-[180px]">
            <span className="badge w-full">
              {weatherData.timezone || "Unknown Location"}
            </span>
            <div className="flex gap-2 w-full">
              <span className="badge w-full">
                Lat: {lat?.toFixed(2) || "--"}
              </span>
              <span className="badge w-full">
                Lon: {lon?.toFixed(2) || "--"}
              </span>
            </div>
            <span className="badge w-full">{date.toDateString()}</span>
            <span className="badge w-full">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Weather Description */}
      {currentWeather?.description && (
        <div className="w-full overflow-hidden whitespace-nowrap border rounded-md bg-secondary text-secondary-foreground border-secondary">
          <p className="inline-block animate-marquee px-3 py-2 text-sm font-medium">
            {currentWeather.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
