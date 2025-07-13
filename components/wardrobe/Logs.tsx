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
import { useGlobalStore } from "@/stores/global_state";
import type { Log } from '@/stores/logs_store'

interface LogsProps {
  viewMode: 'table' | 'grid';
}

const Logs = ({ viewMode }: LogsProps) => {
  const { logs } = useLogStore();
  const { setSelectedItem } = useGlobalStore();

  const handleLogClick = (log: Log) => {
    console.log("Log clicked:", log.id);
    setSelectedItem(log.id, "selectlog");
  };

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
      <div className="w-full h-[200px] flex items-center justify-center">
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
              <TableHead className="w-1/12">Date</TableHead>
              <TableHead className="w-1/12">Weather</TableHead>
              <TableHead className="w-2/12">Outfit</TableHead>
              <TableHead className="w-7/12">Feedback</TableHead>
              <TableHead className="w-1/12 text-center">Comfort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const weatherData = log.weather?.weather_data 
                ? (typeof log.weather.weather_data === 'string' 
                    ? JSON.parse(log.weather.weather_data) 
                    : log.weather.weather_data)
                : null;
              const currentWeather = weatherData?.days?.[0];
              
              return (
                <TableRow
                  key={log.id}
                  data-state={isFocused(log) ? "selected" : undefined}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                  onClick={() => {
                    handleLogClick(log);
                  }}
                >
                  <TableCell className="font-medium truncate">
                    {log.date ? formatDate(log.date) : formatDate(log.created_at)}
                  </TableCell>
                  <TableCell className="truncate">
                    <div className="flex gap-1 flex-wrap">
                      {(currentWeather?.temp || currentWeather?.description) && (
                        <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground">
                          {currentWeather?.temp && `${currentWeather.temp}°`}
                          {currentWeather?.temp && currentWeather?.description && ' & '}
                          {currentWeather?.description && currentWeather.description.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="truncate">
                    {log.outfit?.name && (
                      <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground">
                        {log.outfit.name}
                      </span>
                    )}
                    {!log.outfit?.name && '-'}
                  </TableCell>
                  <TableCell className="truncate">
                    {log.feedback || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getComfortColor(log.comfort_level)}>
                      {log.comfort_level || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {logs.map((log) => {
        const weatherData = log.weather?.weather_data 
          ? (typeof log.weather.weather_data === 'string' 
              ? JSON.parse(log.weather.weather_data) 
              : log.weather.weather_data)
          : null;
        const currentWeather = weatherData?.days?.[0];
        
        return (
          <div
            key={log.id}
            className="relative p-4 border rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary"
            onClick={() => {
              handleLogClick(log);
            }}
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

            {/* Weather and Outfit Info */}
            <div className="mt-2 mb-4">
              <div className="flex gap-1 flex-wrap">
                {(currentWeather?.temp || currentWeather?.description) && (
                  <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-background text-foreground hover:bg-primary hover:text-primary-foreground">
                    {currentWeather?.temp && `${currentWeather.temp}°`}
                    {currentWeather?.temp && currentWeather?.description && ' & '}
                    {currentWeather?.description && currentWeather.description.split(' ')[0]}
                  </span>
                )}
                {log.outfit?.name && (
                  <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-background text-foreground hover:bg-primary hover:text-primary-foreground">
                    {log.outfit.name}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-auto">
              <p className="text-sm text-foreground line-clamp-3">
                {log.feedback || 'No feedback provided'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Logs
