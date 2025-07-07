"use client";
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLogStore } from '@/stores/logs_store'

interface LogsProps {
  viewMode: 'table' | 'grid';
  setFocused?: (item: unknown) => void;
}

const Logs = ({ viewMode, setFocused }: LogsProps) => {
  const { logs } = useLogStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFocused = (_item: unknown) => {
    // You can implement focus logic here if needed
    return false;
  };

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

  if (logs.length === 0) {
    return (
      <div className="w-full h-[200px] border rounded-lg flex items-center justify-center bg-secondary/30">
        <p className="text-muted-foreground">No logs found...</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <ScrollArea>
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/10">Date</TableHead>
              <TableHead className="w-4/10">Feedback</TableHead>
              <TableHead className="w-2/10 text-center">Comfort</TableHead>
              <TableHead className="w-1/10">Outfit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                data-state={isFocused(log) ? "selected" : undefined}
                className="hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                onClick={() => setFocused && setFocused(log)}
              >
                <TableCell className="font-medium truncate">
                  {log.date ? formatDate(log.date) : formatDate(log.created_at)}
                </TableCell>
                <TableCell className="truncate">
                  {log.feedback || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getComfortColor(log.comfort_level)}>
                    {log.comfort_level || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="truncate">
                  {log.outfit_id ? 'Yes' : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {logs.map((log) => (
        <div
          key={log.id}
          className="relative p-4 border rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary"
          onClick={() => setFocused && setFocused(log)}
        >
          <div className="absolute top-3 right-3">
            <Badge variant={getComfortColor(log.comfort_level)}>
              {log.comfort_level || '-'}
            </Badge>
          </div>
          
          <div className="mb-3 pr-12">
            <h3 className="text-sm font-semibold text-primary leading-tight">
              {log.date ? formatDate(log.date) : formatDate(log.created_at)}
            </h3>
          </div>
          
          <div className="mt-auto">
            <p className="text-sm text-foreground line-clamp-3 mb-2">
              {log.feedback || 'No feedback provided'}
            </p>
            {log.outfit_id && (
              <div className="text-xs text-muted-foreground">
                Outfit linked
              </div>
            )}
            {log.weather_id && (
              <div className="text-xs text-muted-foreground">
                Weather data available
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Logs
