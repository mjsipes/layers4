"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_store";
import { useLogStore } from "@/stores/logs_store";

const SelectLogCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { logs, deleteLog } = useLogStore();

  const log = logs.find(l => l.id === selectedItemId);
  console.log("SelectLogCard.log: ", log);

  if (!log) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeatherInfo = () => {
    if (!log.weather?.weather_data) return null;
    
    try {
      const weatherData = typeof log.weather.weather_data === 'string' 
        ? JSON.parse(log.weather.weather_data) 
        : log.weather.weather_data;
      
      // Handle Visual Crossing API structure
      const currentWeather = weatherData?.days?.[0];
      
      if (currentWeather) {
        return {
          temperature: Math.round(currentWeather.temp),
          tempMin: Math.round(currentWeather.tempmin),
          tempMax: Math.round(currentWeather.tempmax),
          humidity: currentWeather.humidity,
          windSpeed: currentWeather.windspeed,
          precip: currentWeather.precip,
          description: currentWeather.description,
          condition: currentWeather.conditions
        };
      }
      
      // Fallback for other weather data structures
      const temp = weatherData?.main?.temp || weatherData?.temperature || weatherData?.temp;
      const condition = weatherData?.weather?.[0]?.main || weatherData?.condition || weatherData?.weather_condition;
      
      if (temp) {
        return {
          temperature: Math.round(temp),
          condition: condition
        };
      }
    } catch (e) {
      console.error('Error parsing weather data:', e);
    }
    
    return null;
  };

  const weatherInfo = getWeatherInfo();

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      <div className="absolute top-3 right-3">
        <Badge variant="default" className="text-sm">
          {log.comfort_level || "-"}
        </Badge>
      </div>

      <div className="mb-3 pr-12">
        <h3 className="text-2xl font-semibold text-primary leading-tight">
          {log.date ? formatDate(log.date) : formatDate(log.created_at)}
        </h3>
      </div>

      {/* Weather Information Card */}
      {weatherInfo && (
        <div className="mt-2 mb-4">
          <div className="p-3  rounded-lg bg-background border-border">
            <div className="space-y-3">
              {/* Temperature and Weather Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Temperature Column */}
                <div className="flex flex-col justify-start">
                  <div className="flex items-start gap-1">
                    <span className="text-3xl font-bold text-blue-600 leading-none">
                      {weatherInfo.temperature}
                    </span>
                    <span className="text-lg font-bold text-blue-600">°</span>
                  </div>
                  {weatherInfo.tempMin && weatherInfo.tempMax && (
                    <div className="flex gap-2 mt-2">
                      <span className="badge text-xs">
                        L: {weatherInfo.tempMin}°
                      </span>
                      <span className="badge text-xs">
                        H: {weatherInfo.tempMax}°
                      </span>
                    </div>
                  )}
                </div>

                {/* Weather Stats Column */}
                <div className="flex flex-col justify-around gap-2">
                  {weatherInfo.windSpeed && (
                    <span className="badge text-xs w-full text-left">
                      Wind: {weatherInfo.windSpeed} mph
                    </span>
                  )}
                  {weatherInfo.humidity && (
                    <span className="badge text-xs w-full text-left">
                      Humidity: {weatherInfo.humidity}%
                    </span>
                  )}
                  {weatherInfo.precip !== undefined && (
                    <span className="badge text-xs w-full text-left">
                      Precip: {weatherInfo.precip}%
                    </span>
                  )}
                </div>
              </div>

              {/* Weather Description */}
              {weatherInfo.description && (
                <div className="w-full overflow-hidden whitespace-nowrap border rounded-md bg-muted border-muted px-2 py-1 text-xs font-medium">
                  {weatherInfo.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Layers Card */}
      {log.layers && log.layers.length > 0 && (
        <div className="mt-2 mb-4">
          <div className="p-3 rounded-lg bg-background ">
            <div className="space-y-2">
              <div className="font-semibold text-primary text-base">
                Layers
              </div>
              <div className="flex gap-1 flex-wrap">
                {log.layers.map((layer) => (
                  <span
                    key={layer.id}
                    className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {layer.name || "Unnamed Layer"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {log.feedback && (
        <div className="mt-2 mb-4">
          <p className="text-base text-foreground leading-relaxed">
            {log.feedback}
          </p>
        </div>
      )}

      <div className="mt-auto">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteLog(log.id)}
          className="flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default SelectLogCard;
