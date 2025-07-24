"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_store";
import { useLogStore } from "@/stores/logs_store";
import { useLayerStore } from "@/stores/layers_store";
import { useLayersSubscription } from "@/hooks/useLayersSubscription";
import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";

const SelectLogCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { logs, deleteLog, updateLog, linkLayerToLog, unlinkLayerFromLog } = useLogStore();
  const { layers } = useLayerStore();
  useLayersSubscription();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    return localDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const log = logs.find(l => l.id === selectedItemId);
  // Move all hooks above this guard
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState(log?.feedback || "");
  React.useEffect(() => {
    setFeedback(log?.feedback || "");
  }, [log?.feedback, log?.id]);

  // For multi-select
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>(log?.layers?.map(l => l.id) || []);
  React.useEffect(() => {
    setSelectedLayerIds(log?.layers?.map(l => l.id) || []);
  }, [log?.layers, log?.id]);

  if (!log) {
    return null;
  }

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

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleFeedbackBlur = async () => {
    if (feedback !== (log.feedback || "")) {
      setSaving(true);
      try {
        await updateLog(log.id, { feedback });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleLayersChange = async (newIds: string[]) => {
    // Find added and removed
    const prev = new Set(selectedLayerIds);
    const next = new Set(newIds);
    for (const id of newIds) {
      if (!prev.has(id)) await linkLayerToLog(log.id, id);
    }
    for (const id of selectedLayerIds) {
      if (!next.has(id)) await unlinkLayerFromLog(log.id, id);
    }
    setSelectedLayerIds(newIds);
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      <div className="absolute top-4 right-4">
        <Badge variant="default" className="text-sm">
          {log.comfort_level || "-"}
        </Badge>
      </div>

      <div className="mb-3 pr-12">
        <h3 className="text-2xl font-semibold text-primary leading-tight">
          {formatDate(log.date || '')}
        </h3>
      </div>

      {/* Weather Information Card */}
      {weatherInfo && (
        <div className="mt-2 mb-2">
          <div className="p-3  rounded-lg bg-background border-border">
            <div className="space-y-3">
              {/* Address Row - styled like weather description */}
              {log.address && (
                <div className="w-full overflow-hidden whitespace-nowrap border rounded-md bg-muted border-muted px-2 py-1 text-xs font-medium">
                  {log.address}
                </div>
              )}
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
      <div className="mt-2 mb-2">
        <MultiSelector
          values={selectedLayerIds}
          onValuesChange={handleLayersChange}
          loop={false}
          className="text-sm"
        >
          <div className="flex flex-wrap gap-1 p-1 py-2 ring-1 ring-muted rounded-md bg-background ">
            {selectedLayerIds.map((id) => {
              const label = layers.find((l) => l.id === id)?.name || id;
              return (
                <span key={id} className="inline-flex items-center px-2 py-0.5 rounded-xl bg-secondary text-xs">
                  {label}
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-destructive"
                    onClick={() => handleLayersChange(selectedLayerIds.filter((v) => v !== id))}
                    aria-label={`Remove ${label}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <MultiSelectorInput />
          </div>
          <MultiSelectorContent>
            <MultiSelectorList>
              {layers.map((layer) => (
                <MultiSelectorItem key={layer.id} value={layer.id}>
                  {layer.name || "Unnamed Layer"}
                </MultiSelectorItem>
              ))}
            </MultiSelectorList>
          </MultiSelectorContent>
        </MultiSelector>
      </div>

      {/* Feedback */}
      <div className="mt-2 mb-2">
        <textarea
          className="w-full border rounded-md p-2 text-base bg-background border-none"
          value={feedback}
          onChange={handleFeedbackChange}
          onBlur={handleFeedbackBlur}
          rows={3}
          disabled={saving}
        />
      </div>

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
