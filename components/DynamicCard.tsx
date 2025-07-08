"use client";
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Star } from "lucide-react";
import AddLayerCard from "@/components/AddLayerCard";
import AddLogCard from "@/components/AddLogCard";
import AddOutfitCard from "@/components/AddOutfitCard";

const DynamicCard = () => {
  const [activeTab, setActiveTab] = useState("layers");

  const renderActiveCard = () => {
    switch (activeTab) {
      case "layers":
        return <AddLayerCard />;
      case "outfits":
        return <AddOutfitCard />;
      case "logs":
        return <AddLogCard />;
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

        <button className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" onClick={() => setActiveTab("recommendations")}>
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
            <DropdownMenuItem onClick={() => setActiveTab("layers")}>
              Layer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("outfits")}>
              Outfit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("logs")}>
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
