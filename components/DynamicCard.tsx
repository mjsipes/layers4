"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Star } from "lucide-react";
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
    <div className="h-[180px] w-full border-b flex flex-row">
      {/* Buttons on the left */}
      <div className="flex flex-col gap-2 p-2 border-r">
        {/* Recommendations button */}

        <button className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" onClick={() => setSelectedItem(null, "recommendations")}>
          <Star size={16} />
        </button>
        {/* Plus button with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors">
              <Plus size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedItem(null, "addlayer")}>
              Layer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedItem(null, "addoutfit")}>
              Outfit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedItem(null, "addlog")}>
              Log
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dynamic card content fills the rest */}
      <div className="flex-1">
        <ScrollArea className="h-full">{renderActiveCard()}</ScrollArea>
      </div>
    </div>
  );
};

export default DynamicCard;
