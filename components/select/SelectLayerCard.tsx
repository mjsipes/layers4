"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_state";
import { useLayerStore } from "@/stores/layers_store";

const SelectLayerCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { layers, deleteLayer } = useLayerStore();

  const layer = layers.find(l => l.id === selectedItemId);

  if (!layer) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {layer.name || "Unnamed Layer"}
          </h3>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteLayer(layer.id)}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Warmth:</span>
          <Badge variant="destructive">{layer.warmth || "-"}</Badge>
        </div>

        {layer.description && (
          <div>
            <span className="text-sm text-muted-foreground">Description:</span>
            <p className="text-sm mt-1">{layer.description}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          ID: {layer.id}
        </div>
      </div>
    </div>
  );
};

export default SelectLayerCard;
