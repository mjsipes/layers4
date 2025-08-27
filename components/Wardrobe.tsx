"use client";
import React from "react";
import { Grid, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layers from "@/components/Layers";
// import Outfits from "@/components/wardrobe/Outfits";

import Logs from "@/components/Logs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalStore } from "@/stores/global-store";

const WardobeCard = () => {
  const { wardrobeViewMode, wardrobeActiveTab, setWardrobeActiveTab, toggleWardrobeViewMode } = useGlobalStore();

  return (
    <div className="w-full">
      <Tabs value={wardrobeActiveTab} onValueChange={(value) => setWardrobeActiveTab(value as "layers"  | "logs")} className="w-full">
        <div className="flex items-center justify-center mt-4 mb-2">
          <div className="flex items-center gap-4 ">
            <TabsList>
              <TabsTrigger value="layers">Layers</TabsTrigger>           
                 {/* <TabsTrigger value="outfits">Outfits</TabsTrigger> */}
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <button
              onClick={toggleWardrobeViewMode}
              className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors"
            >
              {wardrobeViewMode === "table" ? <Grid size={16} /> : <List size={16} />}
            </button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-14rem)] md:h-[calc(100vh-9rem)] px-4">
          <TabsContent value="logs">
            <Logs viewMode={wardrobeViewMode} />
          </TabsContent>
          <TabsContent value="layers">
            <Layers viewMode={wardrobeViewMode} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default WardobeCard;
