"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global-store";
import { useLayerStore } from "@/stores/layers-store";

const SelectLayerCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { layers, deleteLayer, updateLayer } = useLayerStore();

  const layer = layers.find((l) => l.id === selectedItemId);
  // Move all hooks above this guard
  const [name, setName] = React.useState(layer?.name || "");
  React.useEffect(() => {
    setName(layer?.name || "");
  }, [layer?.name, layer?.id]);

  const [desc, setDesc] = React.useState(layer?.description || "");
  React.useEffect(() => {
    setDesc(layer?.description || "");
  }, [layer?.description, layer?.id]);

  if (!layer) {
    return "null layer right now";
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = async () => {
    if (name !== (layer.name || "")) {
      await updateLayer?.(layer.id, { name });
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDesc(e.target.value);
  };

  const handleDescBlur = async () => {
    if (desc !== (layer.description || "")) {
      await updateLayer?.(layer.id, { description: desc });
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary mx-4">
      <div className="absolute top-4 right-4">
        <Badge
          variant="default"
          className="text-sm h-9 w-9 items-center justify-center"
        >
          {layer.warmth || "-"}
        </Badge>
      </div>

      <div className="mb-2 pr-12">
        <input
          className="text-2xl font-semibold text-primary leading-tight w-full bg-background  rounded-md p-1 pl-2 mb-2 h-9"
          value={name}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          placeholder="layer name"
        />
      </div>

      <div className="mb-2">
        <textarea
          className="w-full border  p-2 text-base bg-background rounded-md border-none"
          value={desc}
          onChange={handleDescChange}
          onBlur={handleDescBlur}
          rows={3}
          placeholder="layer description"
        />
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
  );
};

export default SelectLayerCard;
