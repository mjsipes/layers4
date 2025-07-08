"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogStore } from "@/stores/logs_store";

const AddLogCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addLog } = useLogStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const feedback = formData.get("feedback") as string;
      const comfortLevel = formData.get("comfort_level") as string;
      const date = formData.get("date") as string;
      
      await addLog({
        feedback: feedback.trim() || undefined,
        comfort_level: comfortLevel ? parseInt(comfortLevel) : undefined,
        date: date || undefined,
      });
      
      // Reset form
      if (event.currentTarget) {
        event.currentTarget.reset();
        // Reset date to today
        const dateInput = event.currentTarget.querySelector('input[name="date"]') as HTMLInputElement;
        if (dateInput) {
          dateInput.value = new Date().toISOString().split('T')[0];
        }
      }
      
    } catch (error: any) {
      console.error("Error saving log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="log-feedback" className="text-xs">Feedback</Label>
          <Input 
            id="log-feedback" 
            name="feedback" 
            placeholder="How did the outfit feel?..." 
            className="h-8 text-sm"
          />
        </div>
        <div className="w-32">
          <Label htmlFor="log-comfort" className="text-xs">Comfort (1-10)</Label>
          <Input 
            id="log-comfort" 
            name="comfort_level" 
            type="number" 
            min="1" 
            max="10" 
            placeholder="1-10" 
            className="h-8 text-sm"
          />
        </div>
        <div className="w-40">
          <Label htmlFor="log-date" className="text-xs">Date</Label>
          <Input 
            id="log-date" 
            name="date" 
            type="date" 
            defaultValue={new Date().toISOString().split('T')[0]}
            className="h-8 text-sm"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-8 px-4 text-sm"
        >
          {isLoading ? "Saving..." : "Add Log"}
        </Button>
      </div>
    </form>
  );
};

export default AddLogCard;
