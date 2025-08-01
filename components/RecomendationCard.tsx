"use client";
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRecommendationsSubscription } from '@/hooks/useRecommendationsSubscription';
import { useGlobalStore } from '@/stores/global-store';

const RecommendationCard = () => {
  const { recommendations, loading, error } = useRecommendationsSubscription();
  const { setSelectedItem } = useGlobalStore();
  const { selectedItemId, selectedType } = useGlobalStore();

  const handleLayerClick = (layerId: string) => {
    console.log("RecommendationCard/handleLayerClick:", layerId);
    setSelectedItem(layerId, "selectlayer");
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading recommendations...</p>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================
  if (error) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  // ========================================
  // NO RECOMMENDATIONS FOUND
  // ========================================
  if (recommendations.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No recommendations found.</p>
      </div>
    );
  }

  // ========================================
  // RECOMMENDATIONS DISPLAY
  // ========================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-xl font-semibold text-primary">Weather Recommendations</h2>
      
      {recommendations.map((recommendation) => (
        <div key={recommendation.id} className="space-y-3">
          {/* Reasoning paragraph */}
          {recommendation.reasoning && (
            <p className="text-sm text-foreground leading-relaxed">
              {recommendation.reasoning}
            </p>
          )}
          
          {/* Layer grid */}
          {recommendation.layerDetails.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommendation.layerDetails.map((layer) => (
                <div
                  key={layer.id}
                  className={`relative p-2 border-2 rounded-lg bg-secondary cursor-pointer transition-all duration-200 group border-secondary ${
                    selectedType === "selectlayer" && selectedItemId === layer.id
                      ? "border-blue-600"
                      : ""
                  }`}
                  onClick={() => handleLayerClick(layer.id)}
                >
                  <div className="absolute top-1 right-2">
                    <Badge variant="default" className="h-5 w-6 items-center justify-center">
                      {layer.warmth || "-"}
                    </Badge>
                  </div>

                  <div className="mb-2 pr-8">
                    <h3 className="text-sm font-semibold text-primary leading-tight">
                      {layer.name || "Unnamed Layer"}
                    </h3>
                  </div>

                  <p className="text-sm text-foreground line-clamp-3">
                    {layer.description || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecommendationCard;