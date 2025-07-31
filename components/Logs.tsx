"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLogStore } from "@/stores/logs_store";
import { useGlobalStore } from "@/stores/global_store";
import type { Log } from "@/stores/logs_store";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

interface LogsProps {
  viewMode: "table" | "grid";
}

// ========================================
// SORT AND FILTER BAR
// ========================================
const SortFilterBar = ({ 
  table, 
  globalFilter, 
  setGlobalFilter 
}: { 
  table: ReturnType<typeof useReactTable<Log>>; 
  globalFilter: string; 
  setGlobalFilter: (value: string) => void; 
}) => (
  <div className="grid grid-cols-12 gap-4 bg-muted rounded-md p-1">
    <div className="col-span-2">
      <Button
        className="h-7 p-1 hover:bg-background"
        variant="ghost"
        onClick={() =>
          table
            .getColumn("date")
            ?.toggleSorting(
              table.getColumn("date")?.getIsSorted() === "asc"
            )
        }
      >
        <span>Date</span>
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
    <div className="col-span-2">
      <Button
        className="h-7 p-1 hover:bg-background"
        variant="ghost"
        onClick={() =>
          table
            .getColumn("weather")
            ?.toggleSorting(
              table.getColumn("weather")?.getIsSorted() === "asc"
            )
        }
      >
        <span>Temp</span>
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
    <div className="col-span-8 flex items-center justify-end">
      <Input
        placeholder="Search logs by description, date, temperature, address, or layers..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm h-7"
      />
    </div>
  </div>
);

// ========================================
// LOGS COMPONENT
// ========================================

const Logs = ({ viewMode }: LogsProps) => {
  const { logs } = useLogStore();
  const { setSelectedItem } = useGlobalStore();
  const { selectedItemId, selectedType } = useGlobalStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    console.log("Logs.tsx/selectedItemId:", selectedItemId);
  }, [selectedItemId]);

  const handleLogClick = (log: Log) => {
    console.log("Logs.tsx/handleLogClick:", log.id);
    setSelectedItem(log.id, "selectlog");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    return localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getWeatherTemp = (log: Log) => {
    const weatherData = log.weather?.weather_data
      ? typeof log.weather.weather_data === "string"
        ? JSON.parse(log.weather.weather_data)
        : log.weather.weather_data
      : null;
    const currentWeather = weatherData?.days?.[0];
    return currentWeather?.temp || 0;
  };

  const getDateValue = (log: Log) => {
    const dateStr = log.date || log.created_at;
    if (!dateStr) return new Date(0);
    const [year, month, day] = dateStr.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const getWeatherValue = (log: Log) => {
    const weatherData = log.weather?.weather_data
      ? typeof log.weather.weather_data === "string"
        ? JSON.parse(log.weather.weather_data)
        : log.weather.weather_data
      : null;
    const currentWeather = weatherData?.days?.[0];
    return currentWeather?.temp ? `${currentWeather.temp}°` : "";
  };

  // ========================================
  // COLUMNS
  // ========================================

  const columns: ColumnDef<Log>[] = [
    {
      accessorKey: "date",
      header: () => <div>Date</div>,
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div
            className="font-medium truncate cursor-pointer"
            onClick={() => handleLogClick(log)}
          >
            {log.date ? formatDate(log.date) : formatDate(log.created_at)}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = getDateValue(rowA.original);
        const dateB = getDateValue(rowB.original);
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: "weather",
      header: () => <div>Temp</div>,
      cell: ({ row }) => {
        const log = row.original;
        const weatherData = log.weather?.weather_data
          ? typeof log.weather.weather_data === "string"
            ? JSON.parse(log.weather.weather_data)
            : log.weather.weather_data
          : null;
        const currentWeather = weatherData?.days?.[0];

        return (
          <div
            className="truncate cursor-pointer"
            onClick={() => handleLogClick(log)}
          >
            <div className="flex gap-1 overflow-hidden">
              {currentWeather?.temp && (
                <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-secondary text-secondary-foreground flex-shrink-0">
                  {currentWeather?.temp && `${currentWeather.temp}\u00b0`}
                </span>
              )}
              {log.address && (
                <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                  {log.address}
                </span>
              )}
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const tempA = getWeatherTemp(rowA.original);
        const tempB = getWeatherTemp(rowB.original);
        return tempA - tempB;
      },
    },
    {
      accessorKey: "layers",
      header: () => <div>Layers</div>,
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div
            className="truncate p-1 cursor-pointer"
            onClick={() => handleLogClick(log)}
          >
            <div className="flex gap-1 overflow-hidden">
              {log.layers &&
                log.layers.map((layer) => (
                  <span
                    key={layer.id}
                    className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium border transition-colors bg-secondary text-secondary-foreground border-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(layer.id, "selectlayer");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {layer?.name || "Unnamed Layer"}
                  </span>
                ))}
            </div>
          </div>
        );
      },
    },

  ];

  // ========================================
  // TABLE
  // ========================================

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const log = row.original;
      const searchValue = filterValue.toLowerCase();

      // Search in description (feedback)
      const description = log.feedback || ""
      if (description.includes(searchValue)) return true;

      // Search in formatted date
      const formattedDate = formatDate(log.date || log.created_at);
      if (formattedDate.toLowerCase().includes(searchValue)) return true;

      // Search in weather value
      const weatherValue = getWeatherValue(log).toLowerCase();
      if (weatherValue.includes(searchValue)) return true;

      // Search in address
      const address = log.address || "";
      if (address.toLowerCase().includes(searchValue)) return true;

      // Search in layer names
      if (log.layers && log.layers.length > 0) {
        const layerNames = log.layers.map(layer => layer.name || "Unnamed Layer");
        if (layerNames.some(name => name.toLowerCase().includes(searchValue))) {
          return true;
        }
      }

      return false;
    },
  });


  const filteredAndSortedLogs = table
    .getRowModel()
    .rows.map((row) => row.original);

  // ========================================
  // NO LOGS FOUND
  // ========================================

  if (logs.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No logs found...</p>
      </div>
    );
  }

  // ========================================
  // TABLE VIEW
  // ========================================
  if (viewMode === "table") {
    return (
      <div>
        <SortFilterBar 
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <ScrollArea>
          <Table className="table-fixed w-full">
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={`${
                      selectedType === "selectlog" &&
                      selectedItemId === row.original.id
                        ? "bg-muted/80"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className={
                          cell.column.id === "date"
                            ? "w-2/12"
                            : cell.column.id === "weather"
                            ? "w-2/12"
                            : cell.column.id === "layers"
                            ? "w-8/12"
                            : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  }

  // ========================================
  // GRID VIEW
  // ========================================
  return (
    <div>
      <div className="mb-4">
        <SortFilterBar 
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedLogs.map((log) => {
          const weatherData = log.weather?.weather_data
            ? typeof log.weather.weather_data === "string"
              ? JSON.parse(log.weather.weather_data)
              : log.weather.weather_data
            : null;
          const currentWeather = weatherData?.days?.[0];

          return (
            <div
              key={log.id}
              // Add conditional class for blue border if selected
              className={`relative p-2 border-2 rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary ${
                selectedType === "selectlog" && selectedItemId === log.id
                  ? "border-blue-600"
                  : ""
              }`}
              onClick={() => {
                handleLogClick(log);
              }}
            >
              {/* <div className="absolute top-3 right-3">
              <Badge variant="default">
                {log.comfort_level || '-'}
              </Badge>
            </div> */}

              <div className="mb-2">
                <h3 className="text-sm font-semibold text-primary leading-tight">
                  {log.date ? formatDate(log.date) : formatDate(log.created_at)}
                </h3>
              </div>

              {/* Weather and Layers Info */}
              <div className="mt-2 mb-2 flex flex-col gap-2 items-start">
                {currentWeather?.temp && (
                  <div className="p-1 rounded-lg bg-background  w-full">
                    <div className="flex gap-1 w-full">
                      <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-bold bg-secondary text-primary flex-shrink-0">
                        {Math.floor(currentWeather.temp)}°
                      </span>
                      {log.address && (
                        <span className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                          {log.address}
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
                          className="inline-flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground overflow-hidden  whitespace-nowrap "
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
                  {log.feedback || ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Logs;