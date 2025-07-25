"use client";
import React from "react";
import { Plus, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SelectLayerCard from "@/components/dynamic/SelectLayerCard";
import SelectLogCard from "@/components/dynamic/SelectLogCard";
import { useGlobalStore } from "@/stores/global_store";
import { useLayerStore } from "@/stores/layers_store";
import { useLogStore } from "@/stores/logs_store";

const DynamicCard = () => {
  const { selectedType, setSelectedItem } = useGlobalStore();
  const { addLayer } = useLayerStore();
  const { addLog } = useLogStore();

  const handleAddLayer = async () => {
    // Immediately show the editable interface (optimistic UI)
    setSelectedItem(null, "selectlayer");
    
    // Create a new empty layer (with minimal defaults)
    const name = "";
    const description = "";
    const warmth = 5;
    try {
      // Insert the new layer and get its ID
      const newLayerId = await addLayer({ name, description, warmth });
      // Set the new layer as selected
      setSelectedItem(newLayerId, "selectlayer");
    } catch (e) {
      // Optionally handle error
      console.error("Failed to add layer", e);
    }
  };

  const handleAddLog = async () => {
    // Create a new log with minimal/default values
    try {
      const newLogId = await addLog({});
      setSelectedItem(newLogId, "selectlog");
    } catch (e) {
      console.error("Failed to add log", e);
    }
  };

  const renderActiveCard = () => {
    switch (selectedType) {
      // Remove addlayer case
      // case "addlayer":
      //   return <AddLayerCard />;
      // Remove addlog case: no longer show AddLogCard
      case "selectlayer":
        return <SelectLayerCard />;
      // case "selectoutfit":
      //   return <SelectOutfitCard />;
      case "selectlog":
        return <SelectLogCard />;
      case "recommendations":
        return (
          <div className="p-4 text-center text-muted-foreground">
            Recommendations coming soon...
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Action buttons */}
      <div className="flex items-center justify-center pt-4 gap-2">
        <button 
          className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
          onClick={() => setSelectedItem(null, "recommendations")}
        >
          <Star size={14} className="mr-1" />
          Daily Rec&apos;s
        </button>
        <button 
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
          onClick={handleAddLog}
        >
          <Plus size={14} className="mr-1" />
          Log
        </button>
        <button 
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
          onClick={handleAddLayer}
        >
          <Plus size={14} className="mr-1" />
          Layer
        </button>
      </div>
      <ScrollArea className="flex-1">{renderActiveCard()}</ScrollArea>
    </div>
  );
};

export default DynamicCard;
