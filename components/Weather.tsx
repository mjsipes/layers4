"use client";
import React, { useEffect, useState } from "react";
import { useGlobalStore } from "@/stores/global-store";

const WeatherCard = () => {


  const date = useGlobalStore((state) => state.date);
  const address = useGlobalStore((state) => state.address);
  // const lat = useGlobalStore((state) => state.lat);
  // const lon = useGlobalStore((state) => state.lon);
  const { weatherData } = useGlobalStore();
  const [currentTime, setCurrentTime] = useState(new Date());


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading weather data...</p>
      </div>
    );
  }

  const currentWeather = weatherData.days?.[0];

  return (
    <div className="w-full h-full flex flex-col p-4 gap-2 justify-between">
      {/* Location & Time row */}
      <div className="grid grid-cols-4 gap-2">
        <span className="badge truncate col-span-2">{address || "--"}</span>
        {/* <span className="badge truncate">Lat: {lat?.toFixed(2) || "--"}</span>
        <span className="badge truncate">Lon: {lon?.toFixed(2) || "--"}</span> */}
        <span className="badge truncate">{date.toDateString()}</span>
        <span className="badge truncate">{currentTime.toLocaleTimeString()}</span>
      </div>
      {/* Temperature and Weather Stats */}
      <div className=" grid grid-cols-4 gap-2">
        {/* Temperature */}
        <div className="col-span-2 flex flex-col justify-start">
          <div className="flex items-start gap-2">
            <h1 className="text-8xl font-extrabold tracking-tight text-primary leading-none">
              {currentWeather?.temp || "--"}
            </h1>
            <span className="text-3xl font-bold text-primary">°</span>
          </div>
          <div className="flex gap-2 ">
            <span className="badge truncate text-xs ml-1">
              L: {currentWeather?.tempmin || "--"}°
            </span>
            <span className="badge truncate text-xs">
              H: {currentWeather?.tempmax || "--"}°
            </span>
          </div>
        </div>
        {/* Weather Stats */}
        <div className="col-span-2 flex flex-col justify-between gap-2">
          <span className="badge truncate w-full text-left">
            Wind: {currentWeather?.windspeed || "--"} mph
          </span>
          <span className="badge truncate w-full text-left">
            Precip: {currentWeather?.precip || "0"}%
          </span>
          <span className="badge truncate w-full text-left">
            Humidity: {currentWeather?.humidity || "--"}%
          </span>
        </div>
      </div>
      {/* Weather Description */}
      <div className="w-full overflow-hidden whitespace-nowrap border rounded-md bg-secondary text-secondary-foreground border-secondary px-2 py-1 text-sm font-medium animate-marquee">
        {currentWeather?.description}
      </div>
    </div>
  );
};

export default WeatherCard;
