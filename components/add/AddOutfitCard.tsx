"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOutfitStore } from "@/stores/outfits_store";
import { useGlobalStore } from "@/stores/global_state";

const AddOutfitCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addOutfit } = useOutfitStore();
  const { setWardrobeActiveTab } = useGlobalStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      
      await addOutfit({
        name: name.trim(),
      });
      
      // Switch to outfits tab after successful addition
      setWardrobeActiveTab("outfits");
      
      // Reset form
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
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-blue-600 leading-tight">Add Outfit</h3>
        <p className="text-sm text-muted-foreground">
          Create a new outfit to track your clothing combinations
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="outfit-name">Outfit Name</Label>
            <Input 
              id="outfit-name" 
              name="name" 
              placeholder="Enter outfit name..." 
              required 
              className="bg-background shadow-none"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="outfit-description">Description</Label>
            <Input 
              id="outfit-description" 
              name="description" 
              placeholder="Describe this outfit..." 
              className="bg-background shadow-none"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Add Outfit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddOutfitCard;
