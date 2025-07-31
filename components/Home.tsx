"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useGlobalStore } from "@/stores/global_store";
import { useLogStore } from "@/stores/logs_store";
import { useLayerStore } from "@/stores/layers_store";
import Autocomplete from "react-google-autocomplete";
import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import WeatherCard from "./Weather";
import { Separator } from "@radix-ui/react-separator";
import RecommendationCard from "./RecomendationCard";


const Home = () => {
 


  return (
    <div>
      <div className="w-full h-[240px] overflow-hidden">

      <WeatherCard />
      </div>
      <Separator orientation="horizontal" />
      <div className="w-full h-[100px] overflow-hidden border-y">
        <RecommendationCard />
      </div>
      
    </div>
  );
};

export default Home; 