"use client";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLayerStore } from "@/stores/layers-store";

const AddLayerCard = () => {
  const { addLayer } = useLayerStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  // const [warmth, setWarmth] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addLayer({ name, description: desc });
      // setName("");
      // setDesc("");
      // setWarmth(5);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="relative p-4 border rounded-lg bg-secondary border-secondary mx-4"
      onSubmit={handleSubmit}
    >
      <div className="absolute top-4 right-4">
        <Badge variant="default" className="text-sm h-9 w-9">
          {/* {warmth} */}
        </Badge>
      </div>
      <div className="mb-2 pr-12">
        <input
          className="text-2xl font-semibold text-primary leading-tight w-full bg-background rounded-md p-1 mb-2 h-9 pl-2"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="layer name"
        />
      </div>
      <div className="mb-2">
        <textarea
          className="w-full border p-2 text-base bg-background rounded-md border-none"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          placeholder="layer description"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Add Layer"}
      </Button>
    </form>
  );
};

export default AddLayerCard; 