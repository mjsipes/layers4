"use client";
import React from "react";
import { Plus, Calendar1 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SelectLayerCard from "@/components/Layer";
import SelectLogCard from "@/components/Log";
import { useGlobalStore } from "@/stores/global-store";
import AddLogCard from "@/components/AddLog";
import AddLayerCard from "@/components/AddLayer";
import { useLayersSubscription } from "@/hooks/useLayersSubscription";
import { useLogsSubscription } from "@/hooks/useLogsSubscription";
import { useRecommendationsSubscription } from "@/hooks/useRecommendationsSubscription";
import {
  useGlobalSubscription,
  useGeolocation,
  useWeather,
  useAddress,
} from "@/hooks/useGlobalSubscription";
import Home from "./Home";

const DynamicCard = () => {
  useGeolocation();
  useWeather();
  useLayersSubscription();
  useLogsSubscription();
  useRecommendationsSubscription();
  useGlobalSubscription();
  useAddress();
  const { selectedType, setSelectedItem } = useGlobalStore();

  return (
    <div className="w-full">
      <Tabs
        value={selectedType || "home"}
        onValueChange={(value) =>
          setSelectedItem(
            null,
            value as
              | "home"
              | "addlog"
              | "addlayer"
              | "selectlayer"
              | "selectlog"
          )
        }
        className="w-full"
      >
        <div className="flex items-center justify-center mt-4 mb-2">
          <div className="flex items-center gap-4 ">
            <TabsList>
              <TabsTrigger value="home">
                <Calendar1 size={14} className="mr-1" />
                Today
              </TabsTrigger>
              <TabsTrigger value="addlog">
                <Plus size={14} className="mr-1" />
                Log
              </TabsTrigger>
              <TabsTrigger value="addlayer">
                <Plus size={14} className="mr-1" />
                Layer
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-9rem)]">
          <TabsContent value="home">
            <Home />
          </TabsContent>
          <TabsContent value="addlog">
            <AddLogCard />
          </TabsContent>
          <TabsContent value="addlayer">
            <AddLayerCard />
          </TabsContent>
          <TabsContent value="selectlayer">
            <SelectLayerCard />
          </TabsContent>
          <TabsContent value="selectlog">
            <SelectLogCard />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default DynamicCard;
