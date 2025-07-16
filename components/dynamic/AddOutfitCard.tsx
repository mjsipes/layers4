"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOutfitStore } from "@/stores/outfits_store";
import { useLayerStore } from "@/stores/layers_store";
import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";

const AddOutfitCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addOutfit } = useOutfitStore();
  const [value, setValue] = useState<string[]>([]);
  const { layers } = useLayerStore();

  // Compute options from layers
  const layerOptions = layers.map((layer) => ({
    label: layer.name || "Unnamed Layer",
    value: layer.id,
  }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;

      await addOutfit({
        name: name.trim(),
        layer_ids: value,
      });


      if (event.currentTarget) {
        event.currentTarget.reset();
      }
    } catch (error: unknown) {
      console.error("Error saving outfit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4 ">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-blue-600 leading-tight">
          Add Outfit
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="outfit-name">Outfit Name</Label>
            <Input
              id="outfit-name"
              name="name"
              // placeholder="Enter outfit name..."
              required
              className="bg-background border-none"
            />
          </div>
          <div className="grid ">
            <Label htmlFor="outfit-name">Link Layers</Label>
            <MultiSelector
              values={value}
              onValuesChange={setValue}
              loop={false}
            >
              {/* Custom trigger to show label instead of id */}
              <div className="flex flex-wrap gap-1 p-1 py-2 ring-1 ring-muted rounded-md bg-background">
                {value.map((id) => {
                  const label = layerOptions.find((opt) => opt.value === id)?.label || id;
                  return (
                    <span key={id} className="inline-flex items-center px-2 py-1 rounded-xl bg-secondary text-xs mr-1 mb-1">
                      {label}
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => setValue(value.filter((v) => v !== id))}
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
                  {layerOptions.map((option) => (
                    <MultiSelectorItem key={option.value} value={option.value}>
                      {option.label}
                    </MultiSelectorItem>
                  ))}
                </MultiSelectorList>
              </MultiSelectorContent>
            </MultiSelector>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Add Outfit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddOutfitCard;
