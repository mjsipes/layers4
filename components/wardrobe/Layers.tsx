"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLayerStore } from "@/stores/layers_store";
import { useGlobalStore } from "@/stores/global_state";
import type { Layer } from "@/stores/layers_store";

interface LayersProps {
  viewMode: "table" | "grid";
}

const Layers = ({ viewMode }: LayersProps) => {
  const { layers } = useLayerStore();
  const { setSelectedItem } = useGlobalStore();

  const handleLayerClick = (layer: Layer) => {
    console.log("Layer clicked:", layer.id);
    setSelectedItem(layer.id, "selectlayer");
  };

  if (layers.length === 0) {
    return (
      <div className="w-full h-[200px] border rounded-lg flex items-center justify-center bg-secondary/30">
        <p className="text-muted-foreground">Loading layers...</p>
      </div>
    );
  }

  if (viewMode === "table") {
    return (
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Name</TableHead>
            <TableHead className="w-2/3">Description</TableHead>
            <TableHead className="w-1/12 text-center">Warmth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {layers.map((layer) => (
            <TableRow
              key={layer.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => handleLayerClick(layer)}
            >
              <TableCell className="font-medium truncate">
                {layer.name || "Unnamed Layer"}
              </TableCell>
              <TableCell className="font-medium truncate">
                {layer.description || "-"}
              </TableCell>
              <TableCell className="font-medium truncate text-center">
                <Badge variant="destructive">{layer.warmth || "-"}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="relative p-4 border rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary"
          onClick={() => handleLayerClick(layer)}
        >
          <div className="absolute top-3 right-3">
            <Badge variant="destructive">{layer.warmth || "-"}</Badge>
          </div>

          <div className="mb-3 pr-12">
            <h3 className="text-sm font-semibold text-primary leading-tight">
              {layer.name || "Unnamed Layer"}
            </h3>
          </div>

          <div className="mt-auto">
            <p className="text-sm text-foreground line-clamp-3">
              {layer.description || "-"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Layers;
