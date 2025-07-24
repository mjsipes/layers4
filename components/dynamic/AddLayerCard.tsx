"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLayerStore } from "@/stores/layers_store";

const AddLayerCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [warmth, setWarmth] = useState(5);
  const { addLayer } = useLayerStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await addLayer({
        name: name.trim(),
        description: description.trim() || undefined,
        warmth: warmth,
      });

      setName("");
      setDescription("");
      setWarmth(5);
    } catch (error: unknown) {
      console.error("Error saving layer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-blue-600 leading-tight">Add Layer</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="layer-name">Layer Name</Label>
            <Input 
              id="layer-name" 
              name="name" 
              required 
              className="bg-background border-none"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="layer-description">Layer Description</Label>
            <Input 
              id="layer-description" 
              name="description" 
              className="bg-background border-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          {/* <div className="grid gap-2">
            <Label>Warmth: {warmth}/10</Label>
            <Slider
              value={[warmth]}
              onValueChange={([val]) => setWarmth(val)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div> */}
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
