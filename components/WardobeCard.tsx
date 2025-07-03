// WardobeCard.tsx
"use client";
import React, { useEffect } from 'react'
import { useLayerStore } from '@/stores/store'

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
        <ul>
          {layers.map((layer) => (
            <li key={layer.id}>
              <h3>{layer.name || 'Unnamed Layer'}</h3>
              {layer.description && <p>{layer.description}</p>}
              {layer.warmth && <p>Warmth: {layer.warmth}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default WardobeCard