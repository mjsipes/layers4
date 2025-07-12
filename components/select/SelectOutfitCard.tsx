"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_state";
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
    <div className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-blue-600">
              {outfit.name || "Unnamed Outfit"}
            </h3>
            <Badge variant="destructive" className="text-sm">
              {outfit.total_warmth || "-"}
            </Badge>
          </div>
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

        {outfit.layers && outfit.layers.length > 0 && (
          <div>
            <span className="text-base text-muted-foreground font-medium">Layers:</span>
            <div className="flex gap-1 flex-wrap mt-2">
              {outfit.layers.map((layer: Layer) => (
                <span
                  key={layer.id}
                  className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium bg-secondary text-secondary-foreground"
                >
                  {layer.name || "Unnamed Layer"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectOutfitCard;
