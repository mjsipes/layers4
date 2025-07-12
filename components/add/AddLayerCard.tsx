"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayerStore } from "@/stores/layers_store";

const AddLayerCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addLayer } = useLayerStore();

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
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="layer-name" className="text-xs">Layer Name *</Label>
          <Input 
            id="layer-name" 
            name="name" 
            placeholder="Enter layer name..." 
            required 
            className="h-8 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="layer-description" className="text-xs">Description</Label>
          <Input 
            id="layer-description" 
            name="description" 
            placeholder="Enter description..." 
            className="h-8 text-sm"
          />
        </div>
        <div className="w-32">
          <Label htmlFor="layer-warmth" className="text-xs">Warmth (1-10)</Label>
          <Input 
            id="layer-warmth" 
            name="warmth" 
            type="number" 
            min="1" 
            max="10" 
            placeholder="1-10" 
            className="h-8 text-sm"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-8 px-4 text-sm"
        >
          {isLoading ? "Saving..." : "Add Layer"}
        </Button>
      </div>
    </form>
  );
};

export default AddLayerCard;
