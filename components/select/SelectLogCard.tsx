"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_state";
import { useLogStore } from "@/stores/logs_store";

const SelectLogCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { logs, deleteLog } = useLogStore();

  const log = logs.find(l => l.id === selectedItemId);

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

  const getComfortColor = (comfort: number | null) => {
    if (!comfort) return 'secondary';
    if (comfort >= 8) return 'default';
    if (comfort >= 6) return 'secondary';
    return 'destructive';
  };

  const getWeatherInfo = () => {
    if (!log.weather?.weather_data) return null;
    
    try {
      const weatherData = typeof log.weather.weather_data === 'string' 
        ? JSON.parse(log.weather.weather_data) 
        : log.weather.weather_data;
      
      // Handle different possible weather data structures
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
    <div className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-blue-600">
              {log.date ? formatDate(log.date) : formatDate(log.created_at)}
            </h3>
            <Badge variant={getComfortColor(log.comfort_level)} className="text-sm">
              {log.comfort_level || "-"}
            </Badge>
            {weatherInfo && (
              <Badge variant="secondary" className="text-sm">
                {weatherInfo.temperature}°F
                {weatherInfo.condition && ` • ${weatherInfo.condition}`}
              </Badge>
            )}
          </div>
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

        {log.outfit?.name && (
          <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground font-medium">Outfit:</span>
            <span className="text-base">{log.outfit.name}</span>
          </div>
        )}

        {log.feedback && (
          <div className="flex items-start gap-2">
            <span className="text-base text-muted-foreground font-medium">Feedback:</span>
            <span className="text-base leading-relaxed">{log.feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectLogCard;
