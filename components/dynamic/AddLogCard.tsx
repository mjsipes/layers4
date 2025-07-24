"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useLogStore } from "@/stores/logs_store";
import { useLayerStore } from "@/stores/layers_store";
import { useGlobalStore } from "@/stores/global_store";

import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";

// TypeScript: Extend Window interface for Google Maps
declare global {
  interface Window {
    google: unknown;
  }
}

const AddLogCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [comfortLevel, setComfortLevel] = useState(5);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { addLog } = useLogStore();
  const { layers } = useLayerStore();
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const addressFromStore = useGlobalStore((state) => state.address);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const latFromStore = useGlobalStore((state) => state.lat);
  const lonFromStore = useGlobalStore((state) => state.lon);
  const [lat, setLat] = useState<number | null>(latFromStore);
  const [lon, setLon] = useState<number | null>(lonFromStore);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLat(latFromStore);
    setLon(lonFromStore);
    setAddress(addressFromStore || "");
  }, [latFromStore, lonFromStore, addressFromStore]);

  // Extract city from Google Maps place object
  function extractCityFromPlace(place: unknown) {
    if (!place || !(place as { address_components?: unknown[] }).address_components) return "";
    const addressComponents = (place as { address_components?: unknown[] }).address_components;
    const cityComponent = addressComponents?.find((c) =>
      (c as { types?: string[] }).types?.includes("locality")
    );
    return (cityComponent as { long_name?: string })?.long_name || "";
  }

  // Google Places Autocomplete setup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    function initAutocomplete() {
      if (window.google && inputRef.current) {
        const autocomplete = new ((window.google as { maps?: { places?: { Autocomplete?: unknown } } }).maps?.places?.Autocomplete as (new (input: HTMLInputElement, opts: object) => unknown) ?? function() {})(inputRef.current, {
          types: ["geocode"],
        });

        (autocomplete as unknown as { addListener: (event: string, handler: () => void) => void; getPlace?: () => unknown }).addListener("place_changed", () => {
          const place = (autocomplete as unknown as { getPlace: () => unknown }).getPlace();
          const placeObj = place as {
            geometry?: { location?: { lat: () => number; lng: () => number } };
            formatted_address?: string;
          };
          if (!placeObj.geometry || !placeObj.geometry.location) return;

          const newLat = placeObj.geometry.location.lat();
          const newLon = placeObj.geometry.location.lng();

          setLat(newLat);
          setLon(newLon);
          setAddress(placeObj.formatted_address || "");
          setCity(extractCityFromPlace(placeObj));
        });

        if (interval) clearInterval(interval);
      }
    }

    if (!window.google) {
      interval = setInterval(() => {
        if (window.google) {
          initAutocomplete();
        }
      }, 100);
    } else {
      initAutocomplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inputRef]);

  // More robust handler to prevent form submission/tab when Google dropdown is open
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const pacContainers = document.querySelectorAll('.pac-container');
    let isDropdownOpen = false;
    pacContainers.forEach((container) => {
      if (
        container instanceof HTMLElement &&
        container.offsetParent !== null &&
        container.childElementCount > 0
      ) {
        isDropdownOpen = true;
      }
    });
    if (isDropdownOpen && (e.key === 'Enter' || e.key === 'Tab')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      console.log("AddLogCard.handleSubmit: ", feedback, comfortLevel, date, selectedLayers);

      await addLog({
        feedback: feedback,
        comfort_level: comfortLevel,
        date: date ? date.toISOString().slice(0, 10) : undefined,
        layer_ids: selectedLayers,
        lat: lat ?? undefined,
        lon: lon ?? undefined,
        address: address || undefined,
        city: city || undefined,
      });

      setFeedback("");
      setComfortLevel(5);
      setDate(new Date());
      setSelectedLayers([]);
      setAddress("");
      setCity("");
    } catch (error: unknown) {
      console.error("Error saving log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-blue-600 leading-tight ">
          Add Log
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col">
          {/* Autocomplete Address Input */}
          <div className="grid gap-2 mb-4">
            <Label htmlFor="log-address">Location</Label>
            <Input
              id="log-address"
              name="address"
              ref={inputRef}
              placeholder="Start typing address..."
              className="bg-background shadow-none border-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDownCapture={handleAddressKeyDown}
            />
          </div>
          {/* Date Picker */}
          <div className="grid gap-2 mb-4">
            <Label htmlFor="log-date">Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="log-date"
                  className="w-full justify-between font-normal bg-background shadow-none border-none hover:bg-background"
                >
                  {date ? date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setDatePickerOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>


          {/* Feedback */}
          <div className="grid gap-2 mb-4">
            <Label htmlFor="log-feedback">Feedback</Label>
            <Input
              id="log-feedback"
              name="feedback"
              placeholder="Today was a lovely day, but when the sun went down, I felt a bit chilly."
              className="bg-background shadow-none border-none"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          {/* Layer Multi-Select */}
          <div className="grid mb-2">
            <Label>Link Layers</Label>
            <MultiSelector
              values={selectedLayers}
              onValuesChange={setSelectedLayers}
              loop={false}
              className="text-sm"
            >
              <div className="flex flex-wrap gap-1 p-1 py-2 ring-1 ring-muted rounded-md bg-background ">
                {selectedLayers.map((id) => {
                  const label = layers.find((l) => l.id === id)?.name || id;
                  return (
                    <span key={id} className="inline-flex items-center px-2 py-0.5 rounded-xl bg-secondary text-xs">
                      {label}
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => setSelectedLayers(selectedLayers.filter((v) => v !== id))}
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

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Add Log"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLogCard;
