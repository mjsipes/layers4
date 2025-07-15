"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useLogStore } from "@/stores/logs_store";
import { Textarea } from "@/components/ui/textarea"

import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from '@/components/ui/kibo-ui/tags';
import { CheckIcon } from 'lucide-react';

const tags = [
  { id: 'react', label: 'React' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'vuejs', label: 'Vue.js' },
  { id: 'angular', label: 'Angular' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'nodejs', label: 'Node.js' },
  { id: 'python', label: 'Python' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'java', label: 'Java' },
  { id: 'csharp', label: 'C#' },
  { id: 'php', label: 'PHP' },
  { id: 'go', label: 'Go' },
];

const AddLogCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [comfortLevel, setComfortLevel] = useState([5]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { addLog } = useLogStore();



  const [selected, setSelected] = useState<string[]>([]);
  const handleRemove = (value: string) => {
    if (!selected.includes(value)) {
      return;
    }
    console.log(`removed: ${value}`);
    setSelected((prev) => prev.filter((v) => v !== value));
  };
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      handleRemove(value);
      return;
    }
    console.log(`selected: ${value}`);
    setSelected((prev) => [...prev, value]);
  };



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const feedback = formData.get("feedback") as string;

      await addLog({
        feedback: feedback.trim() || undefined,
        comfort_level: comfortLevel[0],
        date: date ? date.toISOString().split("T")[0] : undefined,
      });


      if (event.currentTarget) {
        event.currentTarget.reset();
        setComfortLevel([5]);
        setDate(new Date());
      }
    } catch (error: unknown) {
      console.error("Error saving log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      {/* Header */}
      <div className="mb-6 ">
        <h3 className="text-2xl font-semibold text-blue-600 leading-tight ">
          Add Log
        </h3>
      </div>
    



      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* date input */}
          <div className="grid gap-2">
            {/* <Label htmlFor="log-date">Date</Label> */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="log-date"
                  className="w-full justify-between font-normal bg-background shadow-none"
                >
                  {date ? date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setDatePickerOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* feedback and comfort */}
          <div className="grid gap-2">
            {/* feedback */}
            <Label htmlFor="log-feedback">Description - how did your outfit feel?</Label>
            <Input
              id="log-feedback"
              name="feedback"
              // placeholder="How did your outfit feel?"
              className="bg-background shadow-none"
            />
          </div>
          {/* comfort */}
          <div className="grid gap-2">
            <Label>Comfort: {comfortLevel[0]}/10</Label>
            <Slider
              value={comfortLevel}
              onValueChange={setComfortLevel}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Add Log"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLogCard;
