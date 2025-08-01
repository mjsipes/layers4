"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global-store";
import { useLogStore } from "@/stores/logs-store";
import { useLayerStore } from "@/stores/layers-store";
import Autocomplete from "react-google-autocomplete";
import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";

const SelectLogCard = () => {
  const {
    selectedItemId,
    address: globalAddress,
    lat: globalLat,
    lon: globalLon,
  } = useGlobalStore();
  const { logs, deleteLog, updateLog, linkLayerToLog, unlinkLayerFromLog } =
    useLogStore();
  const { layers } = useLayerStore();

  // Date picker state
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  // Location picker state
  const [address, setAddress] = React.useState("");
  const [lat, setLat] = React.useState<number | null>(null);
  const [lon, setLon] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);

  const log = logs.find((l) => l.id === selectedItemId);
  const [feedback, setFeedback] = React.useState(log?.feedback || "");



  React.useEffect(() => {
    if (log) {
      if (log.date) {
        const [year, month, day] = log.date.split("-");
        setDate(new Date(Number(year), Number(month) - 1, Number(day)));
      }

      setAddress(log.address || globalAddress || "");
      setLat(log.latitude != null ? log.latitude : globalLat);
      setLon(log.longitude != null ? log.longitude : globalLon);
    }
  }, [log, globalAddress, globalLat, globalLon]);

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

  if (!log) {
    return "null log right now";
  }

  // Refactor to match Logs.tsx style
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
    setDate(selectedDate);
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

      setLat(newLat);
      setLon(newLon);
      setAddress(newAddress);

      // Immediately update the log with new address, lat, lon
      console.log(
        "SelectLogCard.handlePlaceSelected: ",
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
    if (address !== (log.address || "")) {
      setSaving(true);
      try {
        await updateLog(log.id, {
          address: address || null,
          latitude: lat,
          longitude: lon,
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
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
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
          defaultValue={address}
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
                      <span className="text-8xl font-bold text-primary leading-none">
                        {Math.floor(weatherDay.temp)}
                      </span>
                      <span className="text-6xl font-bold text-primary">°</span>
                    </div>
                    {weatherDay.tempmin !== undefined &&
                      weatherDay.tempmax !== undefined && (
                        <div className="flex gap-2">
                          <span className="badge text-xs">
                            L: {Math.floor(weatherDay.tempmin)}°
                          </span>
                          <span className="badge text-xs">
                            H: {Math.floor(weatherDay.tempmax)}°
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
    </div>
  );
};

export default SelectLogCard;
