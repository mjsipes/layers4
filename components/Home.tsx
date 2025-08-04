"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useGlobalStore } from "@/stores/global-store";
import { useRecommendationsSubscription } from "@/hooks/useRecommendationsSubscription";
import Autocomplete from "react-google-autocomplete";

const Home = () => {
  const { 
    address: globalAddress, 
    lat: globalLat, 
    lon: globalLon, 
    weatherData,
    setLocation: setGlobalLocation,
    setAddress: setGlobalAddress
  } = useGlobalStore();
  const { recommendations, loading, error } = useRecommendationsSubscription();

  // Location picker state
  const [address, setAddress] = React.useState(globalAddress || "");
  const [lat, setLat] = React.useState<number | null>(globalLat);
  const [lon, setLon] = React.useState<number | null>(globalLon);

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
      <div className="grid grid-cols-2 gap-4">
        {/* Date Display - Fixed to Today */}
        <div>
          <div className="w-full flex items-center bg-background shadow-none border-none text-2xl font-semibold text-primary leading-tight mb-4 pl-4 rounded-md h-9">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Location Picker */}
        <Autocomplete
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          placeholder="start typing address..."
          className="bg-background shadow-none border-none w-full mb-4 p-2 rounded-md ring-1 ring-muted h-9"
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
        <div className="mb-2">
          <div className="p-3 rounded-lg bg-background">
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
        </div>
      ) : (
        <div className="mb-2">
          <div className="p-3 rounded-lg bg-background">
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <div className="mt-2 mb-2">
        {loading ? (
          <div className="p-3 rounded-lg bg-background">
            <p className="text-muted-foreground">Loading recommendations...</p>
          </div>
        ) : error ? (
          <div className="p-3 rounded-lg bg-background">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-3 rounded-lg bg-background">
            <p className="text-muted-foreground">No recommendations found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary">Weather Recommendations</h3>
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="space-y-3">
                {/* Layer grid */}
                {recommendation.layerDetails.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recommendation.layerDetails.map((layer) => (
                      <div
                        key={layer.id}
                        className="relative p-2 border rounded-lg bg-background border-muted"
                      >
                        <div className="absolute top-1 right-2">
                          <Badge variant="default" className="h-5 w-6 items-center justify-center">
                            {layer.warmth || "-"}
                          </Badge>
                        </div>

                        <div className="mb-2 pr-8">
                          <h4 className="text-sm font-semibold text-primary leading-tight">
                            {layer.name || "Unnamed Layer"}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;