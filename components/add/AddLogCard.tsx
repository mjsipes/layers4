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
      
    } catch (error: unknown) {
      console.error("Error saving log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Add Log</h2>
        <p className="text-sm text-muted-foreground">
          Record your experience with an outfit
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="log-feedback">Feedback</Label>
            <Input 
              id="log-feedback" 
              name="feedback" 
              placeholder="How did the outfit feel?..." 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="log-comfort">Comfort (1-10)</Label>
            <Input 
              id="log-comfort" 
              name="comfort_level" 
              type="number" 
              min="1" 
              max="10" 
              placeholder="1-10" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="log-date">Date</Label>
            <Input 
              id="log-date" 
              name="date" 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Add Log"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLogCard;
