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
import { useGlobalStore } from "@/stores/global_store";
import type { Log } from '@/stores/logs_store'

interface LogsProps {
  viewMode: 'table' | 'grid';
}

const Logs = ({ viewMode }: LogsProps) => {
  const { logs } = useLogStore();
  const { setSelectedItem } = useGlobalStore();

  const handleLogClick = (log: Log) => {
    console.log("Logs.tsx/handleLogClick:", log.id);
    setSelectedItem(log.id, "selectlog");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFocused = (_item: unknown) => {
    // You can implement focus logic here if needed
    return false;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    return localDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <TableHead className="w-3/12">Date</TableHead>
              <TableHead className="w-2/12">Weather</TableHead>
              <TableHead className="w-5/12">Layers</TableHead>
              <TableHead className="w-2/12 text-center">Comfort</TableHead>
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
                      {(currentWeather?.temp) && (
                        <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-secondary text-secondary-foreground">
                          {currentWeather?.temp && `${currentWeather.temp}\u00b0`}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="truncate p-1">
                    <div className="p-3 rounded-lg bg-background">
                      <div className="flex gap-1 flex-wrap">
                        {log.layers && 
                          log.layers.map((layer) => (
                            <span
                              key={layer.id}
                              className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium border transition-colors bg-secondary text-secondary-foreground border-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(layer.id, "selectlayer");
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {layer?.name || "Unnamed Layer"}
                            </span>
                          ))
                     }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default">
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

  // Grid view
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
              <Badge variant="default">
                {log.comfort_level || '-'}
              </Badge>
            </div>
            
            <div className="mb-3 pr-12">
              <h3 className="text-sm font-semibold text-primary leading-tight">
                {log.date ? formatDate(log.date) : formatDate(log.created_at)}
              </h3>
            </div>

            {/* Weather and Layers Info */}
            <div className="mt-2 mb-4 flex flex-col gap-2 items-start">
              {(currentWeather?.temp) && (
                <div className="p-1 rounded-lg bg-background  w-full">
                  <div className="flex  gap-1 flex-wrap">
                    <span className="font-bold text-blue-600 text-sm">
                      {Math.round(currentWeather.temp)}°
                    </span>
                    {currentWeather.tempmin !== undefined && (
                      <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground ">
                        L: {Math.round(currentWeather.tempmin)}°
                      </span>
                    )}
                    {currentWeather.tempmax !== undefined && (
                      <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                        H: {Math.round(currentWeather.tempmax)}°
                      </span>
                    )}
                  </div>
                </div>
              )}
              {log.layers && log.layers.length > 0 && (
                <div className="p-1 rounded-lg bg-background w-full">
                  <div className="flex gap-1 flex-wrap">
                    {log.layers.map((layer) => (
                      <span
                        key={layer.id}
                        className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(layer.id, "selectlayer");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {layer.name || "Unnamed Layer"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <p className="text-sm text-foreground line-clamp-3">
                {log.feedback || ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Logs;
