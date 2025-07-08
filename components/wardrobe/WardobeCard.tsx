"use client";
import React from "react";
import { Grid, List, Plus, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layers from "@/components/wardrobe/Layers";
import Outfits from "@/components/wardrobe/Outfits";
import Logs from "@/components/wardrobe/Logs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalStore } from "@/stores/global_state";

const WardobeCard = () => {
  const { wardrobeViewMode, wardrobeActiveTab, setWardrobeActiveTab, toggleWardrobeViewMode, setSelectedItem } = useGlobalStore();



  return (
    <div className="w-full p-4 pb-0">
      <Tabs value={wardrobeActiveTab} onValueChange={(value) => setWardrobeActiveTab(value as "layers" | "outfits" | "logs")} className="w-full">
        <div className="flex items-center justify-center mb-2">
          {/* <h2 className="text-2xl font-bold">Wardrobe</h2> */}
          <div className="flex items-center gap-4">
            {/* Plus and Star buttons */}
            <div className="flex items-center gap-2">
              <button 
                className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
                onClick={() => {
                  const addType = wardrobeActiveTab === "layers" ? "addlayer" : 
                                 wardrobeActiveTab === "outfits" ? "addoutfit" : "addlog";
                  setSelectedItem(null, addType);
                }}
              >
                <Plus size={16} />
              </button>
              <button 
                className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors" 
                onClick={() => setSelectedItem(null, "recommendations")}
              >
                <Star size={16} />
              </button>
            </div>
            
            <TabsList>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="outfits">Outfits</TabsTrigger>
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
        <ScrollArea className="h-[calc(100vh-31rem)]">
          <TabsContent value="layers">
            <Layers viewMode={wardrobeViewMode} />
          </TabsContent>
          <TabsContent value="outfits">
            <Outfits viewMode={wardrobeViewMode} />
          </TabsContent>
          <TabsContent value="logs">
            <Logs viewMode={wardrobeViewMode} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default WardobeCard;
