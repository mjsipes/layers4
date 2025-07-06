"use client";
import React, { useState } from "react";
import { Grid, List } from "lucide-react";
import Layers from "./Layers";

const WardobeCard = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "table" ? "grid" : "table"));
  };

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Layers</h2>
        <button
          onClick={toggleViewMode}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors"
        >
          {viewMode === "table" ? <Grid size={16} /> : <List size={16} />}
        </button>
      </div>

      <Layers viewMode={viewMode} />
    </div>
  );
};

export default WardobeCard;
