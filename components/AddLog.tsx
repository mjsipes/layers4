"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useLogStore } from "@/stores/logs-store";
import { useLayerStore } from "@/stores/layers-store";
import { useGlobalStore } from "@/stores/global-store";
import Autocomplete from "react-google-autocomplete";

import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";

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

  const latFromStore = useGlobalStore((state) => state.lat);
  const lonFromStore = useGlobalStore((state) => state.lon);
  const [lat, setLat] = useState<number | null>(latFromStore);
  const [lon, setLon] = useState<number | null>(lonFromStore);

  useEffect(() => {
    setLat(latFromStore);
    setLon(lonFromStore);
    setAddress(addressFromStore || "");
  }, [latFromStore, lonFromStore, addressFromStore]);

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
      });

      setFeedback("");
      setComfortLevel(5);
      setDate(new Date());
      setSelectedLayers([]);
      setAddress("");
    } catch (error: unknown) {
      console.error("Error saving log:", error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <form
      className="relative p-4 border rounded-lg bg-secondary border-secondary"
      onSubmit={handleSubmit}
    >
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
      
      {/* Location Picker - Simplified! */}
      <Autocomplete
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        placeholder="start typing address..."
        className="bg-background shadow-none border-none w-full mb-2 p-2 rounded-md ring-1 ring-muted h-9"
        defaultValue={address}
        onPlaceSelected={(place) => {
          if (place.geometry && place.geometry.location) {
            setLat(place.geometry.location.lat());
            setLon(place.geometry.location.lng());
            setAddress(place.formatted_address || "");
          }
        }}
        options={{
          types: ["geocode"],
        }}
      />

      {/* Layer Multi-Select */}
      <MultiSelector
        values={selectedLayers}
        onValuesChange={setSelectedLayers}
        loop={false}
        className="text-sm mb-2"
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
          <MultiSelectorInput
          //  placeholder="select layers..."
           />
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
      
      {/* Feedback */}
      <textarea
        id="log-feedback"
        name="feedback"
        placeholder="Today was a lovely day, but when the sun went down, I felt a bit chilly."
        className="w-full border rounded-md p-2 text-base bg-background border-none mb-2"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        disabled={isLoading}
      />
      
      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Add Log"}
      </Button>
    </form>
  );
};

export default AddLogCard;
