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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOutfitStore } from "@/stores/outfits_store";
import { useGlobalStore } from "@/stores/global_state";
import type { Outfit } from "@/stores/outfits_store";

interface OutfitsProps {
  viewMode: "table" | "grid";
}

const Outfits = ({ viewMode }: OutfitsProps) => {
  const { outfits } = useOutfitStore();
  const { setSelectedItem } = useGlobalStore();

  const handleOutfitClick = (outfit: Outfit) => {
    console.log("Outfit clicked:", outfit.id);
    setSelectedItem(outfit.id, "selectoutfit");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFocused = (_item: unknown) => {
    // You can implement focus logic here if needed
    return false;
  };

  if (outfits.length === 0) {
    return (
      <div className="w-full h-[200px] border rounded-lg flex items-center justify-center bg-secondary/30">
        <p className="text-muted-foreground">Loading outfits...</p>
      </div>
    );
  }

  if (viewMode === "table") {
    return (
      <ScrollArea>
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Name</TableHead>
              <TableHead className="w-2/3">Layers</TableHead>
              <TableHead className="w-1/12 text-center">Warmth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outfits.map((item) => (
              <TableRow
                key={item.id}
                data-state={isFocused(item) ? "selected" : undefined}
                className="hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                onClick={() => {
                  handleOutfitClick(item);
                }}
              >
                <TableCell className={"font-medium truncate"}>
                  {item.name || "Unnamed Outfit"}
                </TableCell>
                <TableCell className={"truncate p-1"}>
                  <div className="flex gap-1 flex-wrap">
                    {item.layers.map((layer) => (
                      <span
                        key={layer.id}
                        className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium border transition-colors bg-secondary text-secondary-foreground border-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Could potentially navigate to layers tab and select layer here if needed
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {layer.name || "Unnamed Layer"}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className={"text-center truncate"}>
                  <Badge variant="destructive">
                    {item.total_warmth || "-"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  }
  // Grid view
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {outfits.map((outfit) => (
          <div
            key={outfit.id}
            className="relative p-4 border rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary"
            onClick={() => {
              handleOutfitClick(outfit);
            }}
          >
            <div className="absolute top-3 right-3">
              <Badge variant="destructive">{outfit.total_warmth || "-"}</Badge>
            </div>

            <div className="mb-3 pr-12">
              <h3 className="text-sm font-semibold text-primary leading-tight">
                {outfit.name || "Unnamed Outfit"}
              </h3>
            </div>

            <div className="mt-2 mb-4">
              <div className="flex gap-1 flex-wrap">
                {outfit.layers.map((layer) => (
                  <span
                    key={layer.id}
                    className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could potentially navigate to layers tab and select layer here if needed
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {layer.name || "Unnamed Layer"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default Outfits;
