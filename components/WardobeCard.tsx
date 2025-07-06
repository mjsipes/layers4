"use client";
import React, { useEffect, useState } from "react";
import { useLayerStore } from "@/stores/store";
import { Grid, List } from "lucide-react";
import Layers from "./Layers";

const WardobeCard = () => {
  const { layers, fetchLayers, subscribeToLayers } = useLayerStore();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    fetchLayers();
    const unsubscribe = subscribeToLayers();
    return unsubscribe;
  }, [fetchLayers, subscribeToLayers]);

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

      <Layers layers={layers} viewMode={viewMode} />
    </div>
  );
};

export default WardobeCard;
