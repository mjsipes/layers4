"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayerStore } from "@/stores/layers_store";
import { useGlobalStore } from "@/stores/global_state";

const AddLayerCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addLayer } = useLayerStore();
  const { setWardrobeActiveTab } = useGlobalStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const warmth = formData.get("warmth") as string;
      
      await addLayer({
        name: name.trim(),
        description: description.trim() || undefined,
        warmth: warmth ? parseInt(warmth) : undefined,
      });
      
      // Switch to layers tab after successful addition
      setWardrobeActiveTab("layers");
      
      // Reset form
      if (event.currentTarget) {
        event.currentTarget.reset();
      }
      
    } catch (error: unknown) {
      console.error("Error saving layer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Add Layer</h2>
        <p className="text-sm text-muted-foreground">
          Create a new clothing layer to build your outfits
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="layer-name">Layer Name *</Label>
            <Input 
              id="layer-name" 
              name="name" 
              placeholder="Enter layer name..." 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="layer-description">Description</Label>
            <Input 
              id="layer-description" 
              name="description" 
              placeholder="Enter description..." 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="layer-warmth">Warmth (1-10)</Label>
            <Input 
              id="layer-warmth" 
              name="warmth" 
              type="number" 
              min="1" 
              max="10" 
              placeholder="1-10" 
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
