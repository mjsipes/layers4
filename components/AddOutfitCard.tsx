"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOutfitStore } from "@/stores/outfits_store";

const AddOutfitCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addOutfit } = useOutfitStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      
      await addOutfit({
        name: name.trim(),
      });
      
      // Reset form
      if (event.currentTarget) {
        event.currentTarget.reset();
      }
      
    } catch (error: any) {
      console.error("Error saving outfit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="outfit-name" className="text-xs">Outfit Name *</Label>
          <Input 
            id="outfit-name" 
            name="name" 
            placeholder="Enter outfit name..." 
            required 
            className="h-8 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[300px]">
          <Label htmlFor="outfit-description" className="text-xs">Description</Label>
          <Input 
            id="outfit-description" 
            name="description" 
            placeholder="Describe this outfit..." 
            className="h-8 text-sm"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-8 px-4 text-sm"
        >
          {isLoading ? "Saving..." : "Add Outfit"}
        </Button>
      </div>
    </form>
  );
};

export default AddOutfitCard;
