"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLayerStore } from "@/stores/layers_store";

const AddLayerCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [warmth, setWarmth] = useState([5]);
  const { addLayer } = useLayerStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      
      await addLayer({
        name: name.trim(),
        description: description.trim() || undefined,
        warmth: warmth[0],
      });
      

      if (event.currentTarget) {
        event.currentTarget.reset();
        setWarmth([5]);
      }
      
    } catch (error: unknown) {
      console.error("Error saving layer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-blue-600 leading-tight">Add Layer</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="layer-name">Layer Name</Label>
            <Input 
              id="layer-name" 
              name="name" 
              // placeholder="Enter layer name..." 
              required 
              className="bg-background border-none"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="layer-description">Layer Description</Label>
            <Input 
              id="layer-description" 
              name="description" 
              // placeholder="Enter description..." 
              className="bg-background border-none"
            />
          </div>
          <div className="grid gap-2">
            <Label>Warmth: {warmth[0]}/10</Label>
            <Slider
              value={warmth}
              onValueChange={setWarmth}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Add Layer"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLayerCard;
