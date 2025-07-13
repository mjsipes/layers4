"use client";
import React from "react";
import { Plus, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddLayerCard from "@/components/add/AddLayerCard";
import AddLogCard from "@/components/add/AddLogCard";
import AddOutfitCard from "@/components/add/AddOutfitCard";
import SelectLayerCard from "@/components/select/SelectLayerCard";
import SelectOutfitCard from "@/components/select/SelectOutfitCard";
import SelectLogCard from "@/components/select/SelectLogCard";
import { useGlobalStore } from "@/stores/global_state";

const DynamicCard = () => {
  const { selectedType, setSelectedItem } = useGlobalStore();

  const renderActiveCard = () => {
    switch (selectedType) {
      case "addlayer":
        return <AddLayerCard />;
      case "addoutfit":
        return <AddOutfitCard />;
      case "addlog":
        return <AddLogCard />;
      case "selectlayer":
        return <SelectLayerCard />;
      case "selectoutfit":
        return <SelectOutfitCard />;
      case "selectlog":
        return <SelectLogCard />;
      case "recommendations":
        return (
          <div className="p-4 text-center text-muted-foreground">
            Recommendations coming soon...
          </div>
        );
      default:
        return <AddLayerCard />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Action buttons */}
      <div className="flex items-center justify-center p-2 border-b gap-2">
        <button 
          className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
          onClick={() => setSelectedItem(null, "recommendations")}
        >
          <Star size={14} className="mr-1" />
          Daily Rec&apos;s
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
          onClick={() => setSelectedItem(null, "addoutfit")}
        >
          <Plus size={14} className="mr-1" />
          Outfit
        </button>
        <button 
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
          onClick={() => setSelectedItem(null, "addlog")}
        >
          <Plus size={14} className="mr-1" />
          Log
        </button>
      </div>
      <ScrollArea className="flex-1">{renderActiveCard()}</ScrollArea>
    </div>
  );
};

export default DynamicCard;
