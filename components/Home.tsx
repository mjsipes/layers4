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
import { useGlobalStore } from "@/stores/global-store";
import { useChatContext } from "@/components/chat-context";
import Autocomplete from "react-google-autocomplete";
import { RefreshCw } from "lucide-react";
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
  
  // Use chat context directly instead of global store
  const { append } = useChatContext();

  // Location picker state
  const [address, setAddress] = React.useState(globalAddress || "");
  const [lat, setLat] = React.useState<number | null>(globalLat);
  const [lon, setLon] = React.useState<number | null>(globalLon);
  
  const handleRefreshRecommendations = React.useCallback(() => {
    const message = recommendations.length > 0 
      ? "please give me new weather recommendations" 
      : "what should i wear today";
    
    // Send message directly to chat
    append({
      role: 'user',
      content: message,
    });
  }, [recommendations.length, append]);

  React.useEffect(() => {
    setAddress(globalAddress || "");
    setLat(globalLat);
    setLon(globalLon);
  }, [globalAddress, globalLat, globalLon]);

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

  const currentWeather = weatherData?.days?.[0];

  return (
    <div className="relative p-4 border rounded-lg bg-secondary border-secondary mx-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Date Display - Fixed to Today */}
        <div>
          <div className="w-full flex items-center bg-background shadow-none border-none text-2xl font-semibold text-primary leading-tight px-2 rounded-md h-9 overflow-hidden">
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

      {/* <Textarea placeholder="How did you feel today?" className="w-full border rounded-md p-2 text-base bg-background border-none" /> */}
    </div>
  );
};

export default Home;
