"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_store";
import { useLayerStore } from "@/stores/layers_store";

const SelectLayerCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { layers, deleteLayer } = useLayerStore();

  const layer = layers.find(l => l.id === selectedItemId);

  if (!layer) {
    return null;
  }

  return (
    <div className="relative p-4 border rounded-lg bg-background border-secondary m-4">
      <div className="absolute top-3 right-3">
        <Badge variant="default" className="text-sm">
          {layer.warmth || "-"}
        </Badge>
      </div>

      <div className="mb-3 pr-12">
        <h3 className="text-2xl font-semibold text-primary leading-tight">
          {layer.name || "Unnamed Layer"}
        </h3>
      </div>

      {layer.description && (
        <div className="mt-2 mb-4">
          <p className="text-base text-foreground leading-relaxed">
            {layer.description}
          </p>
        </div>
      )}

      <div className="mt-auto">
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
    </div>
  );
};

export default SelectLayerCard;
