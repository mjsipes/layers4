"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddLayerCard from "@/components/AddLayerCard";
import AddLogCard from "@/components/AddLogCard";
import AddOutfitCard from "@/components/AddOutfitCard";

const DynamicCard = () => {
  const [activeTab, setActiveTab] = useState("layers");




  return (
    <div className="h-[180px] w-full border-b">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flexitems-center justify-center mb-4">
          {/* <h2 className="text-2xl font-bold">Wardrobe</h2> */}
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="recomendations">Recomendations</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="outfits">Outfits</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <ScrollArea className="h-[120px]">
          <TabsContent value="layers" className="mt-0">
            <AddLayerCard />
          </TabsContent>
          
          <TabsContent value="recomendations" className="mt-0">
            <div className="p-4 text-center text-muted-foreground">
              Recommendations coming soon...
            </div>
          </TabsContent>

          <TabsContent value="outfits" className="mt-0">
            <AddOutfitCard />
          </TabsContent>
          
          <TabsContent value="logs" className="mt-0">
            <AddLogCard />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default DynamicCard;
