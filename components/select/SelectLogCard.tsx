"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global_state";
import { useLogStore } from "@/stores/logs_store";

const SelectLogCard = () => {
  const { selectedItemId } = useGlobalStore();
  const { logs, deleteLog } = useLogStore();

  const log = logs.find(l => l.id === selectedItemId);

  if (!log) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getComfortColor = (comfort: number | null) => {
    if (!comfort) return 'secondary';
    if (comfort >= 8) return 'default';
    if (comfort >= 6) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Log Entry
            </h3>
            <p className="text-sm text-muted-foreground">
              {log.date ? formatDate(log.date) : formatDate(log.created_at)}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteLog(log.id)}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Comfort Level:</span>
          <Badge variant={getComfortColor(log.comfort_level)}>
            {log.comfort_level || "-"}
          </Badge>
        </div>

        {log.outfit?.name && (
          <div>
            <span className="text-sm text-muted-foreground">Outfit:</span>
            <p className="text-sm mt-1">{log.outfit.name}</p>
          </div>
        )}

        {log.feedback && (
          <div>
            <span className="text-sm text-muted-foreground">Feedback:</span>
            <p className="text-sm mt-1">{log.feedback}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          ID: {log.id}
        </div>
      </div>
    </div>
  );
};

export default SelectLogCard;
