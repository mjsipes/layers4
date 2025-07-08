"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_state";
import { useOutfitStore } from "@/stores/outfits_store";

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
          <h3 className="text-lg font-semibold">
            {outfit.name || "Unnamed Outfit"}
          </h3>
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
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total Warmth:</span>
          <Badge variant="destructive">{outfit.total_warmth || "-"}</Badge>
        </div>

        {outfit.layers && outfit.layers.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">Layers:</span>
            <div className="flex gap-1 flex-wrap mt-1">
              {outfit.layers.map((layer: any) => (
                <span
                  key={layer.id}
                  className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  {layer.name || "Unnamed Layer"}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          ID: {outfit.id}
        </div>
      </div>
    </div>
  );
};

export default SelectOutfitCard;
