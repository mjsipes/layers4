import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global-store";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useGeolocation() {
  const setLocation = useGlobalStore((state) => state.setLocation);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log('useGeolocation: Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('useGeolocation: Location received:', position);
        setLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('useGeolocation: Error getting location:', error);
      },
      { timeout: 10000 }
    );
  }, [setLocation]);
}

export function useWeather() {
  const setWeatherData = useGlobalStore((state) => state.setWeatherData);
  const lat = useGlobalStore((state) => state.lat);
  const lon = useGlobalStore((state) => state.lon);
  const date = useGlobalStore((state) => state.date);

  useEffect(() => {
    const fetchWeather = async () => {
      console.log('useWeather/fetchWeather:', { lat, lon, date });
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
          console.log('useWeather/fetchWeather: Weather data received:', data);
        setWeatherData(data);
      } catch (err) {
        console.error("useWeather/fetchWeather: Error fetching weather:", err);
      }
    };

    fetchWeather();
  }, [lat, lon, date, setWeatherData]);
}

export function useAddress() {
  const lat = useGlobalStore((state) => state.lat);
  const lon = useGlobalStore((state) => state.lon);
  const setAddress = useGlobalStore((state) => state.setAddress);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();
        const address = data.results?.[0]?.formatted_address || null;
        setAddress(address);
        console.log("useAddress: Resolved address:", address);
      } catch (err) {
        setAddress(null);
        console.error("useAddress: Error fetching address:", err);
      }
    };

    fetchAddress();
  }, [lat, lon, setAddress]);
}


export function useGlobalSubscription() {


  const setSelectedItem = useGlobalStore((state) => state.setSelectedItem);
  const setLocation = useGlobalStore((state) => state.setLocation);

  useEffect(() => {
    const setupGlobalSubscription = async () => {
      try {
        console.log("useGlobalSubscription: Initializing global subscription");
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user?.id) {
          console.log("useGlobalSubscription: No authenticated user or error, skipping subscription");
          return null;
        }

        const channelName = `ui-updates-${user.id}`;
        const channel = supabase
          .channel(channelName)
          .on(
            "broadcast",
            { event: "display-item" },
            (payload) => {
              console.log("useGlobalSubscription: Received display-item event", payload);
              const { selectedItemId, selectedType } = payload.payload || {};
              setSelectedItem(selectedItemId, selectedType);
            }
          )
          .on(
            "broadcast",
            { event: "get-current-ui" },
            (payload) => {
              console.log("useGlobalSubscription: Received get-current-ui event", payload);
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
              console.log("useGlobalSubscription: Received set-location event", payload);
              const { lat, lon } = payload.payload || {};
              setLocation(lat, lon);
            }
          )
          .on(
            "broadcast",
            { event: "get-current-location" },
            (payload) => {
              console.log("useGlobalSubscription: Received get-current-location event", payload);
              const currentState = useGlobalStore.getState();
              console.log("useGlobalSubscription: Current location:", { lat: currentState.lat, lon: currentState.lon });
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

        console.log("useGlobalSubscription: Global subscription initialized:", channelName);
        return channel;
      } catch (err) {
        console.error("useGlobalSubscription: Init error:", err);
        return null;
      }
    };

    let channel: any = null;

    setupGlobalSubscription().then((createdChannel) => {
      channel = createdChannel;
    });

    return () => {
      if (channel) {
        console.log("useGlobalSubscription: Removing global channel");
        supabase.removeChannel(channel);
      }
    };
  }, [setSelectedItem, setLocation]);
} 