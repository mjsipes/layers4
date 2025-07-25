"use client";
import React from "react";
import { Plus, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SelectLayerCard from "@/components/Layer";
import SelectLogCard from "@/components/Log";
import { useGlobalStore } from "@/stores/global_store";
import { useLayerStore } from "@/stores/layers_store";
import { useLogStore } from "@/stores/logs_store";
import AddLogCard from "@/components/AddLog";
import AddLayerCard from "@/components/AddLayer";

const DynamicCard = () => {
  const { selectedType, setSelectedItem, lat, lon, address, date } = useGlobalStore();
  const { addLayer } = useLayerStore();
  const { addLog } = useLogStore();

  const handleAddLayer = async () => {
    setSelectedItem(null, "selectlayer");
    const name = "";
    const description = "";
    const warmth = 5;
    addLayer({ name, description, warmth });
  };

  const handleAddLog = async () => {
    setSelectedItem(null, "addlog");
    addLog({
      lat: lat ?? undefined,
      lon: lon ?? undefined,
      address: address ?? undefined,
      date: date ? date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
  };

  const renderActiveCard = () => {
    switch (selectedType) {
      case "addlayer":
        return <AddLayerCard />;
      case "addlog":
        return <AddLogCard />;
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
          onClick={() => setSelectedItem(null, "addlog")}
        >
          <Plus size={14} className="mr-1" />
          Log
        </button>
        <button 
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
          onClick={() => setSelectedItem(null, "addlayer")}
        >
          <Plus size={14} className="mr-1" />
          Layer
        </button>
        <button 
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
          onClick={handleAddLayer}
        >
          <Plus size={14} className="mr-1" />
          <Plus size={14} className="mr-1" />
          Layer
        </button>
      </div>
      <ScrollArea className="flex-1">{renderActiveCard()}</ScrollArea>
    </div>
  );
};

export default DynamicCard;
