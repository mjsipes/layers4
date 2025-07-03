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

  if (!weatherData) {
    return (
      <div className="w-full h-[350px] border-b flex items-center justify-center">
        <p className="text-muted-foreground">Loading weather data...</p>
      </div>
    );
  }

  const currentWeather = weatherData.days?.[0];

  return (
    <div className="w-full h-[350px] border-b relative overflow-hidden">
      {/* Main Temperature - Top Left */}
      <div className="absolute top-6 left-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-8xl font-extrabold tracking-tight text-primary leading-none">
            {currentWeather?.temp || "--"}
          </h1>
          <span className="text-3xl font-bold text-primary/70">°</span>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary">
            L: {currentWeather?.tempmin || "--"}°
          </span>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary">
            H: {currentWeather?.tempmax || "--"}°
          </span>
        </div>
      </div>

      {/* Location & Time - Top Right */}
      <div className="absolute top-6 right-6 text-right">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
            {weatherData.timezone || "Unknown Location"}
          </span>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Lat: {lat?.toFixed(2) || "--"}
            </span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Lon: {lon?.toFixed(2) || "--"}
            </span>
          </div>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
            {date.toDateString()}
          </span>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Weather Details - Bottom Section */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              UV Index: {currentWeather?.uvindex || "--"}
            </span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Visibility: {currentWeather?.visibility || "--"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Humidity: {currentWeather?.humidity || "--"}%
            </span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Pressure: {currentWeather?.pressure || "--"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Wind: {currentWeather?.windspeed || "--"} mph
            </span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Precip: {currentWeather?.precip || "0"}%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              Feels Like: {currentWeather?.feelslike || "--"}°
            </span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-secondary text-secondary-foreground border-secondary">
              {bears} bears nearby
            </span>
          </div>
        </div>

        {/* Weather Description - Scrolling */}
        {currentWeather?.description && (
          <div className="overflow-hidden whitespace-nowrap border rounded-md bg-secondary text-secondary-foreground border-secondary">
            <p className="inline-block animate-marquee px-3 py-2 text-sm font-medium">
              {currentWeather.description}
            </p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/30 rounded-full blur-2xl"></div>
    </div>
  );
};

export default WeatherCard;