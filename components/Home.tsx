"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useGlobalStore } from "@/stores/global_store";
import { useLogStore } from "@/stores/logs_store";
import { useLayerStore } from "@/stores/layers_store";
import Autocomplete from "react-google-autocomplete";
import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { Tables } from "@/lib/supabase/database.types";

type Log = Tables<"log"> & {
  layers?: Tables<"layer">[];
  weather?: Tables<"weather">;
  recommendedLayers?: Tables<"layer">[];
};

const Home = () => {
  const { logs, addLog, updateLog, linkLayerToLog, unlinkLayerFromLog } = useLogStore();
  const { setSelectedItem, date, lat, lon, address } = useGlobalStore();
  const { layers } = useLayerStore();
  const [loading, setLoading] = useState(true);

  // Date picker state
  const [datePicker, setDatePicker] = React.useState<Date | undefined>(new Date());
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  // Location picker state
  const [addressInput, setAddressInput] = React.useState("");
  const [latInput, setLatInput] = React.useState<number | null>(null);
  const [lonInput, setLonInput] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Find today's log
  const today = new Date().toISOString().split('T')[0];
  const log = logs.find((l) => l.date === today);
  const [feedback, setFeedback] = React.useState(log?.feedback || "");

  // Initialize today's log if it doesn't exist
  useEffect(() => {
    const initializeTodayLog = async () => {
      // Only proceed if logs have been loaded (not empty array from initial state)
      if (logs.length === 0) {
        console.log("Home: Logs not loaded yet, waiting...");
        return;
      }
      
      if (!log) {
        // Create today's log with current data
        try {
          console.log("Home: Creating today's log with data:", {
            date: today,
            lat,
            lon,
            address
          });

          await addLog({
            date: today,
            lat: lat || undefined,
            lon: lon || undefined,
            address: address || undefined,
          });
          
          console.log("Home: Log creation initiated, waiting for subscription update...");
        } catch (error) {
          console.error('Home: Failed to create today\'s log:', error);
          setLoading(false);
          return;
        }
      } else {
        setLoading(false);
      }
    };

    initializeTodayLog();
  }, [logs, date, lat, lon, address, addLog]);

  // Update local state when log changes
  React.useEffect(() => {
    if (log) {
      if (log.date) {
        const [year, month, day] = log.date.split("-");
        setDatePicker(new Date(Number(year), Number(month) - 1, Number(day)));
      }

      setAddressInput(log.address || address || "");
      setLatInput(log.latitude != null ? log.latitude : lat);
      setLonInput(log.longitude != null ? log.longitude : lon);
    }
  }, [log, address, lat, lon]);

  React.useEffect(() => {
    setFeedback(log?.feedback || "");
  }, [log?.feedback, log?.id]);

  // For multi-select
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>(
    log?.layers?.map((l) => l.id) || []
  );
  React.useEffect(() => {
    setSelectedLayerIds(log?.layers?.map((l) => l.id) || []);
  }, [log?.layers, log?.id]);

  // Check if we have today's log after any updates
  useEffect(() => {
    const todayLog = logs.find(log => log.date === today);
    
    if (todayLog && loading) {
      setLoading(false);
    }
  }, [logs, loading, today]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading today's log...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Failed to load today's log</p>
      </div>
    );
  }

  // Weather data processing
  const weatherData = log?.weather?.weather_data
    ? typeof log.weather.weather_data === "string"
      ? (() => {
          try {
            return JSON.parse(log.weather.weather_data);
          } catch {
            return null;
          }
        })()
      : log.weather.weather_data
    : null;
  const weatherDay = weatherData?.days?.[0];

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

  const handleDateChange = async (selectedDate: Date | undefined) => {
    setDatePicker(selectedDate);
    setDatePickerOpen(false);

    if (
      selectedDate &&
      selectedDate.toISOString().slice(0, 10) !== (log.date || "")
    ) {
      setSaving(true);
      try {
        await updateLog(log.id, {
          date: selectedDate.toISOString().slice(0, 10),
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePlaceSelected = async (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const newLat = place.geometry.location.lat();
      const newLon = place.geometry.location.lng();
      const newAddress = place.formatted_address || "";

      setLatInput(newLat);
      setLonInput(newLon);
      setAddressInput(newAddress);

      console.log(
        "Home.handlePlaceSelected: ",
        newAddress,
        newLat,
        newLon
      );
      setSaving(true);
      try {
        await updateLog(log.id, {
          address: newAddress,
          latitude: newLat,
          longitude: newLon,
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAddressBlur = async () => {
    if (addressInput !== (log.address || "")) {
      setSaving(true);
      try {
        await updateLog(log.id, {
          address: addressInput || null,
          latitude: latInput,
          longitude: lonInput,
        });
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
    <div>
      <div className="relative p-4 border rounded-lg bg-secondary border-secondary ">
        {/* Date Picker */}
        <div>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="log-date"
                className="w-full justify-between bg-background shadow-none border-none hover:bg-background hover:text-primary text-2xl font-semibold text-primary leading-tight mb-4"
              >
                {datePicker ? datePicker.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={datePicker}
                captionLayout="dropdown"
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Location Picker - Simplified! */}
        <Autocomplete
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          placeholder="start typing address..."
          className="bg-background shadow-none border-none w-full mb-4 p-2 rounded-md ring-1 ring-muted h-9"
          defaultValue={addressInput}
          onPlaceSelected={handlePlaceSelected}
          onBlur={handleAddressBlur}
          options={{
            types: ["geocode"],
          }}
        />

        {/* Weather Information Card */}
        {weatherDay && (
          <div className="mb-2">
            <div className="p-3 rounded-lg bg-background border-border">
              <div className="space-y-3">
                {/* Temperature and Weather Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Temperature Column */}
                  <div className="flex flex-col justify-start">
                    <div className="flex items-start gap-1">
                      <span className="text-8xl font-bold text-blue-600 leading-none">
                        {Math.round(weatherDay.temp)}
                      </span>
                      <span className="text-6xl font-bold text-blue-600">°</span>
                    </div>
                    {weatherDay.tempmin !== undefined &&
                      weatherDay.tempmax !== undefined && (
                        <div className="flex gap-2">
                          <span className="badge text-xs">
                            L: {Math.round(weatherDay.tempmin)}°
                          </span>
                          <span className="badge text-xs">
                            H: {Math.round(weatherDay.tempmax)}°
                          </span>
                        </div>
                      )}
                  </div>
                  {/* Weather Stats Column */}
                  <div className="flex flex-col justify-between gap-2">
                    {weatherDay.windspeed !== undefined && (
                      <span className="badge text-xs w-full text-left">
                        Wind: {weatherDay.windspeed} mph
                      </span>
                    )}
                    {weatherDay.humidity !== undefined && (
                      <span className="badge text-xs w-full text-left">
                        Humidity: {weatherDay.humidity}%
                      </span>
                    )}
                    {weatherDay.precip !== undefined && (
                      <span className="badge text-xs w-full text-left">
                        Precip: {weatherDay.precip}%
                      </span>
                    )}
                  </div>
                </div>
                {/* Weather Description */}
                {weatherDay.description && (
                  <div className="w-full overflow-hidden whitespace-nowrap border rounded-md bg-muted border-muted px-2 py-1 text-xs font-medium">
                    {weatherDay.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weather Recommendations Card */}
        {log.recommendedLayers && log.recommendedLayers.length > 0 && (
          <div className="mb-2">
            <div className="p-3 rounded-lg bg-background border-border">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary">Weather Recommendations</h3>
                <div className="flex flex-wrap gap-1">
                  {log.recommendedLayers.map((layer) => (
                    <span
                      key={layer.id}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium"
                    >
                      {layer.name || "Unnamed Layer"}
                    </span>
                  ))}
                </div>
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
            <div className="flex flex-wrap gap-1 p-1 py-2 ring-1 ring-muted rounded-md bg-background">
              {selectedLayerIds.map((id) => {
                const label = layers.find((l) => l.id === id)?.name || id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center px-2 py-0.5 rounded-xl bg-secondary text-xs"
                  >
                    {label}
                    <button
                      type="button"
                      className="ml-1 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        handleLayersChange(
                          selectedLayerIds.filter((v) => v !== id)
                        )
                      }
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
            placeholder="Today was a lovely day, but when the sun went down, I felt a bit chilly."
          />
        </div>
      </div>
    </div>
  );
};

export default Home; 