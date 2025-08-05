"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TextEffect } from "@/components/ui/text-effect";
import { useGlobalStore, type ProposedLayer } from "@/stores/global-store";
import { useLogStore } from "@/stores/logs-store";
import { useLayerStore } from "@/stores/layers-store";
import Autocomplete from "react-google-autocomplete";
import { RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const {
    address: globalAddress,
    lat: globalLat,
    lon: globalLon,
    weatherData,
    recommendations,
    setLocation: setGlobalLocation,
    setAddress: setGlobalAddress,
  } = useGlobalStore();
  const { addMessage } = useGlobalStore();
  const { logs, addLog, updateLog, linkLayerToLog, unlinkLayerFromLog } =
    useLogStore();
  const { layers } = useLayerStore();
  const { matchedLayers, proposedLayers, clearClothingAnalysis, setMatchedLayers, setProposedLayers } = useGlobalStore();

  const handleRefreshRecommendations = () => {
    const message =
      recommendations.length > 0
        ? "please give me new weather recommendations"
        : "what should i wear today";
    addMessage(message);
  };

  // Location picker state
  const [address, setAddress] = React.useState(globalAddress || "");
  const [lat, setLat] = React.useState<number | null>(globalLat);
  const [lon, setLon] = React.useState<number | null>(globalLon);

  // Today's log state
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = logs.find((log) => log.date === today);

  // Feedback state
  const [feedback, setFeedback] = React.useState(todayLog?.feedback || "");
  const [saving, setSaving] = React.useState(false);

  // Clothing input state
  const [clothingInput, setClothingInput] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);

  // Selected layers state
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>(
    todayLog?.layers?.map((l) => l.id) || []
  );

  React.useEffect(() => {
    setAddress(globalAddress || "");
    setLat(globalLat);
    setLon(globalLon);
  }, [globalAddress, globalLat, globalLon]);

  React.useEffect(() => {
    setFeedback(todayLog?.feedback || "");
  }, [todayLog?.feedback, todayLog?.id]);

  React.useEffect(() => {
    setSelectedLayerIds(todayLog?.layers?.map((l) => l.id) || []);
  }, [todayLog?.layers, todayLog?.id]);

  // Auto-select high confidence matched layers
  React.useEffect(() => {
    if (matchedLayers.length > 0) {
      const autoSelectedIds = matchedLayers
        .filter((layer: any) => layer.similarity && layer.similarity > 0.8)
        .map((layer: any) => layer.id);
      if (autoSelectedIds.length > 0) {
        console.log("🔥 Auto-selecting high confidence matches:", autoSelectedIds);
        setSelectedLayerIds(prev => [...new Set([...prev, ...autoSelectedIds])]);
      }
    }
  }, [matchedLayers]);

  // Debug logs - only when state actually changes
  React.useEffect(() => {
    console.log("🎯 Selected layer IDs changed:", selectedLayerIds);
  }, [selectedLayerIds]);

  React.useEffect(() => {
    console.log("🔍 Matched layers changed:", matchedLayers);
  }, [matchedLayers]);

  React.useEffect(() => {
    console.log("💡 Proposed layers changed:", proposedLayers);
  }, [proposedLayers]);

  // Debounced clothing analysis
  React.useEffect(() => {
    if (!clothingInput.trim()) {
      console.log("❌ Empty input, clearing results");
      clearClothingAnalysis();
      return;
    }

    const timeoutId = setTimeout(async () => {
      console.log("⏰ Starting analysis after 500ms delay for:", clothingInput);
      setAnalyzing(true);
      try {
        // Simple API call - the AI will analyze layers and return structured response
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `The following is a description by the user of what they wore today: "${clothingInput}". Please reference the user's existing layers. If any layers in the description match the user's existing layers, pass them as matched_layers. If any clothing items are unfamiliar (not in existing layers), create proposed_layers for them.`,
              },
            ],
          }),
        });

        console.log("📡 Analysis request sent, parsing JSON response...");
        
        if (response.ok) {
          const analysisResult = await response.json();
          console.log("🎯 Structured analysis result:", analysisResult);
          
          // Update global state directly (no realtime needed)
          setMatchedLayers(analysisResult.matched_layers || []);
          setProposedLayers(analysisResult.proposed_layers || []);
          
          // Auto-select high confidence matches
          const autoSelectedIds = (analysisResult.matched_layers || [])
            .filter((layer: any) => layer.similarity > 0.8)
            .map((layer: any) => layer.id);
          
          if (autoSelectedIds.length > 0) {
            setSelectedLayerIds(prev => [...new Set([...prev, ...autoSelectedIds])]);
          }
        } else {
          console.error("❌ Analysis request failed:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("💥 Error analyzing clothing:", error);
      } finally {
        console.log("🏁 Analysis request complete");
        setAnalyzing(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [clothingInput, clearClothingAnalysis]);

  const handlePlaceSelected = async (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const newLat = place.geometry.location.lat();
      const newLon = place.geometry.location.lng();
      const newAddress = place.formatted_address || "";

      setLat(newLat);
      setLon(newLon);
      setAddress(newAddress);

      setGlobalAddress(newAddress);
      setGlobalLocation(newLat, newLon);
    }
  };

  const handleAddressBlur = async () => {
    setGlobalAddress(address || null);
    if (lat !== null && lon !== null) {
      setGlobalLocation(lat, lon);
    }
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleFeedbackBlur = async () => {
    if (feedback !== (todayLog?.feedback || "")) {
      setSaving(true);
      try {
        if (todayLog) {
          await updateLog(todayLog.id, { feedback });
        } else {
          // Create new log for today
          const logId = await addLog({
            feedback,
            date: today,
            lat: globalLat || undefined,
            lon: globalLon || undefined,
            address: globalAddress || undefined,
          });
          // Link selected layers to the new log
          for (const layerId of selectedLayerIds) {
            await linkLayerToLog(logId, layerId);
          }
        }
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreateProposedLayer = async (proposedLayer: ProposedLayer) => {
    setSaving(true);
    try {
      // Create the new layer
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Create a new layer with name "${proposedLayer.name}", description "${proposedLayer.description}", and warmth ${proposedLayer.warmth}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        if (reader) {
          let result = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
          }

          // Parse the response to get the created layer ID
          const lines = result.split("\n");
          for (const line of lines) {
            if (line.startsWith("2:")) {
              try {
                const toolResult = JSON.parse(line.slice(2));
                if (toolResult.toolName === "insert_layer") {
                  const layerData = JSON.parse(toolResult.result);
                  const match = layerData.match(/"id":"([^"]+)"/);
                  if (match) {
                    const newLayerId = match[1];
                    // Add to selected layers
                    setSelectedLayerIds((prev) => [...prev, newLayerId]);
                    // Remove from proposed layers
                    setProposedLayers((prev: ProposedLayer[]) =>
                      prev.filter((p: ProposedLayer) => p.name !== proposedLayer.name)
                    );
                    // Link to today's log
                    await handleLayerToggle(newLayerId, true);
                  }
                  break;
                }
              } catch (e) {
                console.log("Failed to parse layer creation result:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error creating layer:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLayerToggle = async (layerId: string, add: boolean) => {
    if (add) {
      if (!todayLog) {
        // Create new log with this layer
        setSaving(true);
        try {
          await addLog({
            date: today,
            lat: globalLat || undefined,
            lon: globalLon || undefined,
            address: globalAddress || undefined,
            layer_ids: [layerId],
          });
        } finally {
          setSaving(false);
        }
      } else {
        // Link layer to existing log
        await linkLayerToLog(todayLog.id, layerId);
      }
    } else {
      if (todayLog) {
        await unlinkLayerFromLog(todayLog.id, layerId);
      }
      setSelectedLayerIds((prev) => prev.filter((id) => id !== layerId));
    }
  };

  const handleRemoveProposedLayer = (proposedLayer: ProposedLayer) => {
    setProposedLayers((prev: ProposedLayer[]) =>
      prev.filter((p: ProposedLayer) => p.name !== proposedLayer.name)
    );
  };

  const currentWeather = weatherData?.days?.[0];

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary mx-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Date Display - Fixed to Today */}
        <div>
          <div className="w-full flex items-center bg-background shadow-none border-none text-2xl font-semibold text-primary leading-tight pl-4 rounded-md h-9">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Location Picker */}
        <Autocomplete
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          placeholder="start typing address..."
          className="bg-background shadow-none border-none w-full p-2 rounded-md ring-1 ring-muted h-9"
          defaultValue={address}
          onPlaceSelected={handlePlaceSelected}
          onBlur={handleAddressBlur}
          options={{
            types: ["geocode"],
          }}
        />
      </div>

      {/* Weather Information Card */}
      {currentWeather ? (
        <div className="p-3 rounded-lg bg-background mb-4 h-[185px]">
          <div className="space-y-3">
            {/* Temperature and Weather Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Temperature Column */}
              <div className="flex flex-col justify-start">
                <div className="flex items-start gap-1">
                  <span className="text-8xl font-bold text-primary leading-none">
                    {Math.floor(currentWeather.temp)}
                  </span>
                  <span className="text-6xl font-bold text-primary">°</span>
                </div>
                {currentWeather.tempmin !== undefined &&
                  currentWeather.tempmax !== undefined && (
                    <div className="flex gap-2">
                      <span className="badge text-xs">
                        L: {Math.floor(currentWeather.tempmin)}°
                      </span>
                      <span className="badge text-xs">
                        H: {Math.floor(currentWeather.tempmax)}°
                      </span>
                    </div>
                  )}
              </div>
              {/* Weather Stats Column */}
              <div className="flex flex-col justify-between gap-2">
                {currentWeather.windspeed !== undefined && (
                  <span className="badge text-xs w-full text-left">
                    Wind: {currentWeather.windspeed} mph
                  </span>
                )}
                {currentWeather.humidity !== undefined && (
                  <span className="badge text-xs w-full text-left">
                    Humidity: {currentWeather.humidity}%
                  </span>
                )}
                {currentWeather.precip !== undefined && (
                  <span className="badge text-xs w-full text-left">
                    Precip: {currentWeather.precip}%
                  </span>
                )}
              </div>
            </div>
            {/* Weather Description */}
            {currentWeather.description && (
              <div className="w-full overflow-hidden whitespace-nowrap border rounded-md bg-muted border-muted px-2 py-1 text-xs font-medium">
                {currentWeather.description}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="p-3 rounded-lg bg-background h-[185px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <div className="p-3 rounded-lg bg-background border border-muted">
        <div className="flex items-center justify-between ">
          <h3 className="text-lg font-semibold text-primary">
            Weather Recommendations
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshRecommendations}
            className="h-8 w-8 p-0 bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="space-y-3">
            {/* Layer grid */}
            {recommendation.layerDetails.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {recommendation.layerDetails.map((layer) => (
                  <div
                    key={layer.id}
                    className="relative p-2 border rounded-md bg-muted border-muted"
                  >
                    <div className="absolute top-1 right-1">
                      <Badge
                        variant="default"
                        className="h-6 w-6 items-center justify-center"
                      >
                        {layer.warmth || ""}
                      </Badge>
                    </div>

                    <div className=" pr-8">
                      <h4 className="text-sm font-semibold text-primary leading-tight">
                        {layer.name || "Unnamed Layer"}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reasoning in Accordion */}
            {recommendation.reasoning && (
              <div className=" px-3 rounded-md bg-muted border border-muted mt-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="reasoning" className="border-none">
                    <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground py-1">
                      View reasoning
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <div className="text-sm text-foreground leading-relaxed pb-1.5">
                        <TextEffect per="char" preset="fade" speedReveal={10}>
                          {recommendation.reasoning}
                        </TextEffect>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clothing Input */}
      <div className="mt-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Input Area - 2/3 width */}
          <div className="col-span-2">
            <textarea
              className="w-full border rounded-md p-2 text-base bg-background border-none resize-none"
              value={clothingInput}
              onChange={(e) => setClothingInput(e.target.value)}
              rows={3}
              placeholder="What did you wear today? (e.g., 'blue jeans and white t-shirt')"
            />
          </div>

          {/* Badges Area - 1/3 width */}
          <div className="flex flex-col gap-2">
            {/* Analyzing Status */}
            {analyzing && (
              <div className="text-xs text-muted-foreground px-2 py-1">
                Analyzing clothing...
              </div>
            )}



            {/* Selected Layers */}
            {selectedLayerIds.map((id) => {
              const layer = layers.find((l) => l.id === id);
              if (!layer) return null;
              return (
                <div
                  key={id}
                  className="inline-flex items-center px-2 py-1 rounded-xl bg-secondary text-xs border"
                >
                  {layer.name}
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-destructive"
                    onClick={() => handleLayerToggle(id, false)}
                    aria-label={`Remove ${layer.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}

            {/* Matched Layers (not yet selected) */}
            {matchedLayers
              .filter((layer) => !selectedLayerIds.includes(layer.id))
              .map((layer) => (
                <div
                  key={layer.id}
                  className="inline-flex items-center px-2 py-1 rounded-xl bg-blue-100 dark:bg-blue-900 text-xs border border-blue-300 dark:border-blue-700"
                >
                  {layer.name}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setSelectedLayerIds((prev) => [...prev, layer.id]);
                      handleLayerToggle(layer.id, true);
                    }}
                    aria-label={`Add ${layer.name}`}
                  >
                    <Check size={12} />
                  </button>
                </div>
              ))}

            {/* Proposed New Layers */}
            {proposedLayers.map((layer, index) => (
              <div
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-xl bg-green-100 dark:bg-green-900 text-xs border border-green-300 dark:border-green-700"
              >
                {layer.name}?
                <button
                  type="button"
                  className="ml-1 text-green-600 hover:text-green-800"
                  onClick={() => handleCreateProposedLayer(layer)}
                  aria-label={`Create ${layer.name}`}
                  disabled={saving}
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveProposedLayer(layer)}
                  aria-label={`Dismiss ${layer.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="mt-4">
        <textarea
          className="w-full border rounded-md p-2 text-base bg-background border-none"
          value={feedback}
          onChange={handleFeedbackChange}
          onBlur={handleFeedbackBlur}
          rows={3}
          disabled={saving}
          placeholder="How did you feel today?"
        />
      </div>
    </div>
  );
};

export default Home;
