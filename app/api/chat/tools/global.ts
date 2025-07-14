import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const displayUITool = tool({
  description: "Display or select a specific item in the UI. Use this when the user asks to 'show me', 'pull up', 'display', or 'select' a particular outfit, layer, or log. This will update the UI to show the selected item in the main display area.",
  parameters: z.object({
    selectedItemId: z.string().nullable().describe("ID of the item to display (can be null to clear selection)"),
    selectedType: z.enum([
      "selectlayer", 
      "selectoutfit", 
      "selectlog", 
      "addlayer", 
      "addoutfit", 
      "addlog", 
      "recommendations"
    ]).describe("Type of item to display: 'selectlayer' for layers, 'selectoutfit' for outfits, 'selectlog' for logs, or 'add*' for adding new items"),
  }),
  execute: async ({ selectedItemId, selectedType }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user for private channel
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [GLOBAL] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [GLOBAL] Sending display command:", { selectedItemId, selectedType });

      // Send display command via private channel
      const channelName = `ui-updates-${user.id}`;
      await supabase
        .channel(channelName)
        .send({
          type: "broadcast",
          event: "display-item",
          payload: {
            selectedItemId: selectedItemId,
            selectedType: selectedType,
          },
        });

      console.log("🟢 [GLOBAL] Display command sent successfully");
      return `✅ Successfully sent display command: selectedItemId=${selectedItemId}, selectedType=${selectedType}`;
    } catch (error: unknown) {
      console.error("🔴 [GLOBAL] Failed to send display command:", error);
      return `⚠️ Failed to send display command: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
});

export const setLocationTool = tool({
  description: "Set the user's current location coordinates. Use this when the user asks to update their location or when you need to set specific coordinates for weather data.",
  parameters: z.object({
    lat: z.number().describe("Latitude coordinate"),
    lon: z.number().describe("Longitude coordinate"),
  }),
  execute: async ({ lat, lon }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user for private channel
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [GLOBAL] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [GLOBAL] Setting location:", { lat, lon });

      // Send location update via private channel
      const channelName = `ui-updates-${user.id}`;
      await supabase
        .channel(channelName)
        .send({
          type: "broadcast",
          event: "set-location",
          payload: {
            lat: lat,
            lon: lon,
          },
        });

      console.log("🟢 [GLOBAL] Location update sent successfully");
      return `✅ Successfully set location: lat=${lat}, lon=${lon}`;
    } catch (error: unknown) {
      console.error("🔴 [GLOBAL] Failed to set location:", error);
      return `⚠️ Failed to set location: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
});

export const getLocationTool = tool({
  description: "Get the user's current location coordinates. Use this when you need to know where the user is located for weather data or location-based features.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();

      // Get the authenticated user for private channel
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [GLOBAL] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [GLOBAL] Requesting current location");

      // Create a Promise that waits for the response
      const requestId = Date.now();
      const channelName = `ui-updates-${user.id}`;
      
      const locationPromise = new Promise<{ lat: number | null; lon: number | null }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Location request timed out"));
        }, 5000); // 5 second timeout

        // Set up a one-time listener for the response
        const channel = supabase.channel(channelName);
        channel
          .on(
            "broadcast",
            { event: "location-state-response" },
            (payload) => {
              console.log("🟢 [GLOBAL] Received location response:", payload);
              const { requestId: responseRequestId, lat, lon } = payload.payload || {};
              
              if (responseRequestId === requestId) {
                clearTimeout(timeout);
                resolve({ lat, lon });
                supabase.removeChannel(channel);
              }
            }
          )
          .subscribe();

        // Send the request
        channel.send({
          type: "broadcast",
          event: "get-current-location",
          payload: {
            requestId: requestId,
          },
        });
      });

      // Wait for the response
      const location = await locationPromise;
      
      if (location.lat === null || location.lon === null) {
        return `📍 No location data available. The user's location has not been set yet.`;
      }

      return `📍 Current location: lat=${location.lat}, lon=${location.lon}`;
    } catch (error: unknown) {
      console.error("🔴 [GLOBAL] Failed to get current location:", error);
      return `⚠️ Failed to get current location: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
});

export const getCurrentUITool = tool({
  description: "Get the currently selected item and type from the UI. Use this when the user asks 'what am I currently viewing?' or 'what's selected?' to understand the current UI state.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();

      // Get the authenticated user for private channel
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [GLOBAL] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [GLOBAL] Requesting current UI state");

      // Send request for current UI state via private channel
      const requestId = Date.now();
      const channelName = `ui-updates-${user.id}`;
      await supabase
        .channel(channelName)
        .send({
          type: "broadcast",
          event: "get-current-ui",
          payload: {
            requestId: requestId,
          },
        });

      console.log("🟢 [GLOBAL] Current UI state request sent successfully");
      return `✅ Requested current UI state. The client will respond with the current selection.`;
    } catch (error: unknown) {
      console.error("🔴 [GLOBAL] Failed to request current UI state:", error);
      return `⚠️ Failed to request current UI state: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
}); 