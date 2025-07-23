import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global_store";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Geolocation functionality
function useGeolocation() {
  const setLocation = useGlobalStore((state) => state.setLocation);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { timeout: 10000 }
    );
  }, [setLocation]);
}

// Weather functionality
function useWeather() {
  const setWeatherData = useGlobalStore((state) => state.setWeatherData);
  const lat = useGlobalStore((state) => state.lat);
  const lon = useGlobalStore((state) => state.lon);
  const date = useGlobalStore((state) => state.date);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!lat || !lon || !date) return;

      try {
        const res = await fetch("/api/weather", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: lat,
            longitude: lon,
            date: date.toISOString().split("T")[0],
          }),
        });

        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    };

    fetchWeather();
  }, [lat, lon, date, setWeatherData]);
}

export { useGeolocation, useWeather };

export function useGlobalSubscription() {
  const setSelectedItem = useGlobalStore((state) => state.setSelectedItem);
  const setLocation = useGlobalStore((state) => state.setLocation);
  
  // Initialize geolocation and weather
  useGeolocation();
  useWeather();

  useEffect(() => {
    const setupGlobalSubscription = async () => {
      try {
        console.log("🔵 [GLOBAL] Initializing global subscription");
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user?.id) {
          console.log("🟡 [GLOBAL] No authenticated user or error, skipping subscription");
          return null;
        }

        const channelName = `ui-updates-${user.id}`;
        const channel = supabase
          .channel(channelName)
          .on(
            "broadcast",
            { event: "display-item" },
            (payload) => {
              console.log("🔵 [GLOBAL] Received display-item event", payload);
              const { selectedItemId, selectedType } = payload.payload || {};
              setSelectedItem(selectedItemId, selectedType);
            }
          )
          .on(
            "broadcast",
            { event: "get-current-ui" },
            (payload) => {
              console.log("🔵 [GLOBAL] Received get-current-ui event", payload);
              const currentState = useGlobalStore.getState();
              supabase.channel(channelName).send({
                type: "broadcast",
                event: "ui-state-response",
                payload: {
                  requestId: payload.payload?.requestId,
                  selectedItemId: currentState.selectedItemId,
                  selectedType: currentState.selectedType,
                },
              });
            }
          )
          .on(
            "broadcast",
            { event: "set-location" },
            (payload) => {
              console.log("🔵 [GLOBAL] Received set-location event", payload);
              const { lat, lon } = payload.payload || {};
              setLocation(lat, lon);
            }
          )
          .on(
            "broadcast",
            { event: "get-current-location" },
            (payload) => {
              console.log("🔵 [GLOBAL] Received get-current-location event", payload);
              const currentState = useGlobalStore.getState();
              console.log("🔵 [GLOBAL] Current location:", { lat: currentState.lat, lon: currentState.lon });
              supabase.channel(channelName).send({
                type: "broadcast",
                event: "location-state-response",
                payload: {
                  requestId: payload.payload?.requestId,
                  lat: currentState.lat,
                  lon: currentState.lon,
                },
              });
            }
          )
          .subscribe();

        console.log("🟢 [GLOBAL] Global subscription initialized:", channelName);
        return channel;
      } catch (err) {
        console.error("🔴 [GLOBAL] Init error:", err);
        return null;
      }
    };

    let channel: any = null;

    setupGlobalSubscription().then((createdChannel) => {
      channel = createdChannel;
    });

    return () => {
      if (channel) {
        console.log("🟡 [GLOBAL] Removing global channel");
        supabase.removeChannel(channel);
      }
    };
  }, [setSelectedItem, setLocation]);
} 