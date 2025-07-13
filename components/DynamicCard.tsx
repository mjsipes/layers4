"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddLayerCard from "@/components/add/AddLayerCard";
import AddLogCard from "@/components/add/AddLogCard";
import AddOutfitCard from "@/components/add/AddOutfitCard";
import SelectLayerCard from "@/components/select/SelectLayerCard";
import SelectOutfitCard from "@/components/select/SelectOutfitCard";
import SelectLogCard from "@/components/select/SelectLogCard";
import { useGlobalStore } from "@/stores/global_state";

const DynamicCard = () => {
  const { selectedType } = useGlobalStore();

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
    <div className="h-full w-full">
      <ScrollArea className="h-full">{renderActiveCard()}</ScrollArea>
    </div>
  );
};

export default DynamicCard;
