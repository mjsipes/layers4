"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_store";
import { useOutfitStore } from "@/stores/outfits_store";
import type { Layer } from "@/stores/layers_store";

const SelectOutfitCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { outfits, deleteOutfit } = useOutfitStore();

  const outfit = outfits.find(o => o.id === selectedItemId);

  if (!outfit) {
    return null;
  }

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary m-4">
      <div className="absolute top-3 right-3">
        <Badge variant="default" className="text-sm">
          {outfit.total_warmth || "-"}
        </Badge>
      </div>

      <div className="mb-3 pr-12">
        <h3 className="text-2xl font-semibold text-primary leading-tight">
          {outfit.name || "Unnamed Outfit"}
        </h3>
      </div>

      {outfit.layers && outfit.layers.length > 0 && (
        <div className="mt-2 mb-4">
          <div className="flex gap-1 flex-wrap">
            {outfit.layers.map((layer: Layer) => (
              <span
                key={layer.id}
                className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                {layer.name || "Unnamed Layer"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteOutfit(outfit.id)}
          className="flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default SelectOutfitCard;
