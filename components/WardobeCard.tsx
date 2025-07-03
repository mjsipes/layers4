// WardobeCard.tsx
"use client";
import React, { useEffect } from 'react'
import { useLayerStore } from '@/stores/store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const WardobeCard = () => {
  const { layers, fetchLayers, subscribeToLayers } = useLayerStore();
  
  useEffect(() => {
    fetchLayers();
    const unsubscribe = subscribeToLayers();
    return unsubscribe;
  }, [fetchLayers, subscribeToLayers]);
  
  return (
    <div>
      <h2>Layers</h2>
      {layers.length === 0 ? (
        <p>No layers found</p>
      ) : (
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
                  {layer.warmth || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default WardobeCard