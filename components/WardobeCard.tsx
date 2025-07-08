"use client";
import React, { useState } from "react";
import { Grid, List, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layers from "./Layers";
import Outfits from "./Outfits";
import Logs from "./Logs";
import AddItemDialog from "./AddItemDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const WardobeCard = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [activeTab, setActiveTab] = useState("layers");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [focusedItem, setFocusedItem] = useState<unknown>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "table" ? "grid" : "table"));
  };

  const handleAddItem = () => {
    setDialogOpen(true);
  };

  return (
    <div className="w-full p-6 pb-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-center mb-4">
          {/* <h2 className="text-2xl font-bold">Wardrobe</h2> */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddItem}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors"
            >
              <Plus size={16} />
            </button>
            <TabsList>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="outfits">Outfits</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <button
              onClick={toggleViewMode}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors"
            >
              {viewMode === "table" ? <Grid size={16} /> : <List size={16} />}
            </button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-25rem)]">
          <TabsContent value="layers">
            <Layers viewMode={viewMode} />
          </TabsContent>
          <TabsContent value="outfits">
            <Outfits
              viewMode={viewMode}
              setFocused={setFocusedItem}
              setTab={setActiveTab}
            />
          </TabsContent>
          <TabsContent value="logs">
            <Logs viewMode={viewMode} setFocused={setFocusedItem} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activeTab={activeTab}
      />
    </div>
  );
};

export default WardobeCard;
