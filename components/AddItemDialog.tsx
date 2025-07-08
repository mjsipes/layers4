"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayerStore } from "@/stores/layers_store";
import { useLogStore } from "@/stores/logs_store";
import { useOutfitStore } from "@/stores/outfits_store";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onOpenChange,
  activeTab,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addLayer } = useLayerStore();
  const { addLog } = useLogStore();
  const { addOutfit } = useOutfitStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      if (activeTab === "layers") {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const warmth = formData.get("warmth") as string;
        
        
        await addLayer({
          name: name.trim(),
          description: description.trim() || undefined,
          warmth: warmth ? parseInt(warmth) : undefined,
        });
        
      } else if (activeTab === "logs") {
        const feedback = formData.get("feedback") as string;
        const comfortLevel = formData.get("comfort_level") as string;
        const date = formData.get("date") as string;
        
        
        await addLog({
          feedback: feedback.trim() || undefined,
          comfort_level: comfortLevel ? parseInt(comfortLevel) : undefined,
          date: date || undefined,
        });
        
      } else if (activeTab === "outfits") {
        const name = formData.get("name") as string;
        
        
        await addOutfit({
          name: name.trim(),
        });
        
      }

      // Close dialog on success
      onOpenChange(false);
      
      // Reset form safely
      if (event.currentTarget) {
        event.currentTarget.reset();
      }
      
    } catch (error: any) {
      // You can add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Backup click handler for debugging
  const handleButtonClick = () => {
  };
  const getDialogContent = () => {
    switch (activeTab) {
      case "layers":
        return {
          title: "Add Layer",
          description: "Add a new layer to your wardrobe",
        };
      case "outfits":
        return {
          title: "Add Outfit",
          description: "Add a new outfit to your wardrobe",
        };
      case "logs":
        return {
          title: "Add Log",
          description: "Add a new log entry",
        };
      default:
        return {
          title: "Add Item",
          description: "Add a new item",
        };
    }
  };

  const { title, description } = getDialogContent();

  const renderFormFields = () => {
    if (activeTab === "layers") {
      return (
        <>
          <div className="grid gap-3">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Enter layer name..." 
              required 
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              name="description" 
              placeholder="Enter description..." 
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="warmth">Warmth Level (1-10)</Label>
            <Input 
              id="warmth" 
              name="warmth" 
              type="number" 
              min="1" 
              max="10" 
              placeholder="Enter warmth level..." 
            />
          </div>
        </>
      );
    } else if (activeTab === "logs") {
      return (
        <>
          <div className="grid gap-3">
            <Label htmlFor="feedback">Feedback</Label>
            <Input 
              id="feedback" 
              name="feedback" 
              placeholder="How did the outfit feel?..." 
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="comfort_level">Comfort Level (1-10)</Label>
            <Input 
              id="comfort_level" 
              name="comfort_level" 
              type="number" 
              min="1" 
              max="10" 
              placeholder="Rate your comfort..." 
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date" 
              name="date" 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
        </>
      );
    } else if (activeTab === "outfits") {
      return (
        <>
          <div className="grid gap-3">
            <Label htmlFor="name">Outfit Name *</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Enter outfit name..." 
              required 
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="outfit-description">Description</Label>
            <Input 
              id="outfit-description" 
              name="description" 
              placeholder="Describe this outfit..." 
            />
          </div>
        </>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {renderFormFields()}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isLoading}
              onClick={handleButtonClick}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
