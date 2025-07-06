"use client";
import React, { useEffect, useState } from 'react'
import { useLayerStore } from '@/stores/store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Grid, List } from 'lucide-react'

const WardobeCard = () => {
  const { layers, fetchLayers, subscribeToLayers } = useLayerStore();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  useEffect(() => {
    fetchLayers();
    const unsubscribe = subscribeToLayers();
    return unsubscribe;
  }, [fetchLayers, subscribeToLayers]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'table' ? 'grid' : 'table');
  };
  
  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Layers</h2>
        <button
          onClick={toggleViewMode}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 transition-colors"
        >
          {viewMode === 'table' ? (
            <>
              <Grid size={16} />
            </>
          ) : (
            <>
              <List size={16} />
            </>
          )}
        </button>
      </div>

      {layers.length === 0 ? (
        <div className="w-full h-[200px] border rounded-lg flex items-center justify-center bg-secondary/30">
          <p className="text-muted-foreground">No layers found</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6/20">Name</TableHead>
                  <TableHead className="w-1/2">Description</TableHead>
                  <TableHead className="w-2/20 text-center">Warmth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {layers.map((layer) => (
                  <TableRow
                    key={layer.id}
                    className="hover:bg-muted/50 cursor-pointer"
                  >
                    <TableCell className="font-medium truncate">
                      {layer.name || 'Unnamed Layer'}
                    </TableCell>
                    <TableCell className="font-medium truncate">
                      {layer.description || '-'}
                    </TableCell>
                    <TableCell className="font-medium truncate text-center">
                      <Badge variant="destructive">
                        {layer.warmth || '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="relative p-4 border rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary"
                >
                  <div className="absolute top-3 right-3">
                    <Badge variant="destructive">
                      {layer.warmth || '-'}
                    </Badge>
                  </div>
                  
                  <div className="mb-3 pr-12">
                    <h3 className="text-lg font-semibold text-primary leading-tight">
                      {layer.name || 'Unnamed Layer'}
                    </h3>
                  </div>
                  
                  <div className="mt-auto">
                    <p className="text-sm text-foreground line-clamp-3">
                      {layer.description || '-'}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WardobeCard