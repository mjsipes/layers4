"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useLogStore } from "@/stores/logs_store";


import { useLayerStore } from "@/stores/layers_store";
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
      });

      setFeedback("");
      setComfortLevel(5);
      setDate(new Date());
      setSelectedLayers([]);
    } catch (error: unknown) {
      console.error("Error saving log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      {/* Header */}
      <div className="mb-6 ">
        <h3 className="text-2xl font-semibold text-blue-600 leading-tight ">
          Add Log
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* date input */}
          <div className="grid gap-2">
            <Label htmlFor="log-date">Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="log-date"
                  className="w-full justify-between font-normal bg-background shadow-none"
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
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setDatePickerOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* feedback and comfort */}
          <div className="grid gap-2">
            {/* feedback */}
            <Label htmlFor="log-feedback">Feedback</Label>
            <Input
              id="log-feedback"
              name="feedback"
              placeholder="Today was a lovely day, but when the sun went down, I felt a bit chilly."
              className="bg-background shadow-none border-none"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          </div>
          {/* layer multi-select */}
          <div className="grid ">
            <Label>Link Layers</Label>
            <MultiSelector
              values={selectedLayers}
              onValuesChange={setSelectedLayers}
              loop={false}
            >
              <div className="flex flex-wrap gap-1 p-1 py-2 ring-1 ring-muted rounded-md bg-background">
                {selectedLayers.map((id) => {
                  const label = layers.find((l) => l.id === id)?.name || id;
                  return (
                    <span key={id} className="inline-flex items-center px-2 py-1 rounded-xl bg-secondary text-xs mr-1 mb-1">
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
          {/* comfort */}
          <div className="grid gap-2">
            <Label>Comfort: {comfortLevel}/10</Label>
            <Slider
              value={[comfortLevel]}
              onValueChange={([val]) => setComfortLevel(val)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
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
