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
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-blue-600">
              {layer.name || "Unnamed Layer"}
            </h3>
            <Badge variant="destructive" className="text-sm">
              {layer.warmth || "-"}
            </Badge>
          </div>
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

        {layer.description && (
          <div>
            <span className="text-base text-muted-foreground font-medium">Description:</span>
            <p className="text-base mt-2 leading-relaxed">{layer.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectLayerCard;
