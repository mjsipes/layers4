"use client";
import React, { useState } from "react";
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
import { useLayerStore } from "@/stores/layers_store";
import { useGlobalStore } from "@/stores/global_store";
import type { Layer } from "@/stores/layers_store";
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

interface LayersProps {
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
  table: ReturnType<typeof useReactTable<Layer>>; 
  globalFilter: string; 
  setGlobalFilter: (value: string) => void; 
}) => (
  <div className="grid grid-cols-12 gap-4 bg-muted rounded-md p-1">
    <div className="col-span-2">
      <Button
        className="h-7 p-1 hover:bg-primary hover:text-primary-foreground"
        variant="ghost"
        onClick={() =>
          table
            .getColumn("name")
            ?.toggleSorting(
              table.getColumn("name")?.getIsSorted() === "asc"
            )
        }
      >
        <span>Name</span>
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
    <div className="col-span-2">
      <Button
        className="h-7 p-1 hover:bg-primary hover:text-primary-foreground"
        variant="ghost"
        onClick={() =>
          table
            .getColumn("created_at")
            ?.toggleSorting(
              table.getColumn("created_at")?.getIsSorted() === "asc"
            )
        }
      >
        <span>Created</span>
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
    <div className="col-span-8 flex items-center justify-end">
      <Input
        placeholder="Search layers by name or description..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm h-7"
      />
    </div>
  </div>
);

// ========================================
// LAYERS COMPONENT
// ========================================
const Layers = ({ viewMode }: LayersProps) => {
  const { layers } = useLayerStore();
  const { setSelectedItem } = useGlobalStore();
  const { selectedItemId, selectedType } = useGlobalStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleLayerClick = (layer: Layer) => {
    console.log("Layers.tsx/handleLayerClick:", layer.id);
    setSelectedItem(layer.id, "selectlayer");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDateValue = (layer: Layer) => {
    const dateStr = layer.created_at;
    if (!dateStr) return new Date(0);
    return new Date(dateStr);
  };

  const getLayerDescription = (layer: Layer) => {
    return layer.description || "";
  };

  // ========================================
  // COLUMNS
  // ========================================
  const columns: ColumnDef<Layer>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              className="p-1 hover:bg-primary hover:text-primary-foreground"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Name</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const layer = row.original;
        return (
          <div
            className="font-medium truncate cursor-pointer"
            onClick={() => handleLayerClick(layer)}
          >
            {layer.name || "Unnamed Layer"}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: () => <div>Description</div>,
      cell: ({ row }) => {
        const layer = row.original;
        return (
          <div
            className="truncate cursor-pointer"
            onClick={() => handleLayerClick(layer)}
          >
            {layer.description || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "warmth",
      header: () => <div className="text-center">Warmth</div>,
      cell: ({ row }) => {
        const layer = row.original;
        return (
          <div
            className="text-center cursor-pointer"
            onClick={() => handleLayerClick(layer)}
          >
            <Badge variant="default">{layer.warmth || "-"}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              className="p-1 hover:bg-primary hover:text-primary-foreground"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Created</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const layer = row.original;
        return (
          <div
            className="font-medium truncate cursor-pointer"
            onClick={() => handleLayerClick(layer)}
          >
            {formatDate(layer.created_at)}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = getDateValue(rowA.original);
        const dateB = getDateValue(rowB.original);
        return dateA.getTime() - dateB.getTime();
      },
    },
  ];

  // ========================================
  // TABLE
  // ========================================
  const table = useReactTable({
    data: layers,
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
      const layer = row.original;
      const searchValue = filterValue.toLowerCase();

      // Search in name
      const name = (layer.name || "").toLowerCase();
      if (name.includes(searchValue)) return true;

      // Search in description
      const description = getLayerDescription(layer).toLowerCase();
      if (description.includes(searchValue)) return true;

      return false;
    },
  });

  const filteredAndSortedLayers = table
    .getRowModel()
    .rows.map((row) => row.original);

  // ========================================
  // NO LAYERS FOUND
  // ========================================
  if (layers.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading layers...</p>
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
                      selectedType === "selectlayer" &&
                      selectedItemId === row.original.id
                        ? "bg-muted/80"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className={
                          cell.column.id === "name"
                            ? "w-4/12"
                            : cell.column.id === "description"
                            ? "w-6/12"
                            : cell.column.id === "warmth"
                            ? "w-2/12 text-center"
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
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAndSortedLayers.map((layer) => (
          <div
            key={layer.id}
            className={`relative p-4 border-2 rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary ${
              selectedType === "selectlayer" && selectedItemId === layer.id
                ? "border-blue-500"
                : ""
            }`}
            onClick={() => handleLayerClick(layer)}
          >
            <div className="absolute top-3 right-3">
              <Badge variant="default">{layer.warmth || "-"}</Badge>
            </div>

            <div className="mb-3 pr-12">
              <h3 className="text-sm font-semibold text-primary leading-tight">
                {layer.name || "Unnamed Layer"}
              </h3>
            </div>

            <div className="mt-auto">
              <p className="text-sm text-foreground line-clamp-3">
                {layer.description || "-"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layers;
