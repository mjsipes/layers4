import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const displayUITool = tool({
  description:
    "Display or select a specific item in the UI. Use this when the user asks to 'show me', 'pull up', 'display', or 'select' a particular outfit, layer, or log. This will update the UI to show the selected item in the main display area.",
  parameters: z.object({
    selectedItemId: z
      .string()
      .nullable()
      .describe("ID of the item to display (can be null to clear selection)"),
    selectedType: z
      .enum([
        "selectlayer",
        "selectoutfit",
        "selectlog",
        "addlayer",
        "addoutfit",
        "addlog",
        "home",
      ])
      .describe(
        "Type of item to display: 'selectlayer' for layers, 'selectoutfit' for outfits, 'selectlog' for logs, or 'add*' for adding new items"
      ),
  }),
  execute: async ({ selectedItemId, selectedType }) => {
    console.log("displayUITool: executing with:", {
      selectedItemId,
      selectedType,
    });
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("displayUITool: error getting user:", userError);
        return `displayUITool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("displayUITool: no authenticated user found");
        return `displayUITool: No authenticated user found.`;
      }

      console.log("displayUITool: sending display command:", {
        selectedItemId,
        selectedType,
      });
      const channelName = `ui-updates-${user.id}`;
      await supabase.channel(channelName).send({
        type: "broadcast",
        event: "display-item",
        payload: {
          selectedItemId: selectedItemId,
          selectedType: selectedType,
        },
      });
      console.log("displayUITool: display command sent successfully");
      return `displayUITool: Successfully sent display command: selectedItemId=${selectedItemId}, selectedType=${selectedType}`;
    } catch (error: unknown) {
      console.error("displayUITool: failed to send display command:", error);
      return `displayUITool: Failed to send display command: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const setLocationTool = tool({
  description:
    "Set the user's current location coordinates. Use this when the user asks to update their location or when you need to set specific coordinates for weather data.",
  parameters: z.object({
    lat: z.number().describe("Latitude coordinate"),
    lon: z.number().describe("Longitude coordinate"),
  }),
  execute: async ({ lat, lon }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("setLocationTool: error getting user:", userError);
        return `setLocationTool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("setLocationTool: no authenticated user found");
        return `setLocationTool: No authenticated user found.`;
      }

      console.log("setLocationTool: setting location:", { lat, lon });
      const channelName = `ui-updates-${user.id}`;
      await supabase.channel(channelName).send({
        type: "broadcast",
        event: "set-location",
        payload: {
          lat: lat,
          lon: lon,
        },
      });
      console.log("setLocationTool: location update sent successfully");
      return `setLocationTool: Successfully set location: lat=${lat}, lon=${lon}`;
    } catch (error: unknown) {
      console.error("setLocationTool: failed to set location:", error);
      return `setLocationTool: Failed to set location: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const getLocationTool = tool({
  description:
    "Get the user's current location coordinates. Use this when you need to know where the user is located for weather data or location-based features.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("getLocationTool: error getting user:", userError);
        return `getLocationTool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("getLocationTool: no authenticated user found");
        return `getLocationTool: No authenticated user found.`;
      }

      console.log("getLocationTool: requesting current location");
      const requestId = Date.now();
      const channelName = `ui-updates-${user.id}`;
      const locationPromise = new Promise<{
        lat: number | null;
        lon: number | null;
      }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Location request timed out"));
        }, 5000);
        const channel = supabase.channel(channelName);
        channel
          .on("broadcast", { event: "location-state-response" }, (payload) => {
            console.log(
              "getLocationTool: received location response:",
              payload
            );
            const {
              requestId: responseRequestId,
              lat,
              lon,
            } = payload.payload || {};

            if (responseRequestId === requestId) {
              clearTimeout(timeout);
              resolve({ lat, lon });
              supabase.removeChannel(channel);
            }
          })
          .subscribe();
        channel.send({
          type: "broadcast",
          event: "get-current-location",
          payload: {
            requestId: requestId,
          },
        });
      });
      const location = await locationPromise;
      console.log("getLocationTool: location data received:", location);
      return `getLocationTool: Current location: lat=${location.lat}, lon=${location.lon}`;

    } catch (error: unknown) {
      console.error("getLocationTool: failed to get current location:", error);
      return `getLocationTool: Failed to get current location: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const getCurrentUITool = tool({
  description:
    "Get the currently selected item and type from the UI. Use this when the user asks 'what am I currently viewing?' or 'what's selected?' to understand the current UI state.",
  parameters: z.object({}),
  execute: async () => {
    try {

      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("getCurrentUITool: error getting user:", userError);
        return `getCurrentUITool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("getCurrentUITool: no authenticated user found");
        return `getCurrentUITool: No authenticated user found.`;
      }

      console.log("getCurrentUITool: requesting current UI state");
      const requestId = Date.now();
      const channelName = `ui-updates-${user.id}`;
      await supabase.channel(channelName).send({
        type: "broadcast",
        event: "get-current-ui",
        payload: {
          requestId: requestId,
        },
      });
      console.log("getCurrentUITool: current UI state request sent successfully");
      return `getCurrentUITool: Requested current UI state. The client will respond with the current selection.`;

    } catch (error: unknown) {
      console.error("getCurrentUITool: failed to request current UI state:", error);
      return `getCurrentUITool: Failed to request current UI state: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const setClothingInputTool = tool({
  description: "Update the clothing analysis UI state with matched existing layers and proposed new layers. Use this after analyzing user's clothing description.",
  parameters: z.object({
    matched_layers: z.array(z.object({
      id: z.string().describe("ID of the matched layer"),
      name: z.string().describe("Name of the layer"),
      description: z.string().nullable().describe("Description of the layer"),
      warmth: z.number().nullable().describe("Warmth level of the layer"),
      similarity: z.number().optional().describe("Similarity score (0-1)")
    })).describe("Array of existing layers that match the user's description"),
    proposed_layers: z.array(z.object({
      name: z.string().describe("Name for the proposed new layer"),
      description: z.string().describe("Description for the proposed new layer"),
      warmth: z.number().describe("Warmth level for the proposed layer (1-10)")
    })).describe("Array of new layers to propose for unrecognized clothing items")
  }),
  execute: async ({ matched_layers, proposed_layers }) => {
    try {
      console.log("setClothingInputTool: Executing with:", { matched_layers, proposed_layers });
      
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError || !user?.id) {
        console.error("setClothingInputTool: Authentication error:", userError);
        return `setClothingInputTool: Authentication error: ${userError?.message || 'No user'}`;
      }

      // Prepare the analysis result
      const analysisResult = {
        type: 'clothing_analysis',
        matched_layers,
        proposed_layers,
        user_id: user.id
      };

      console.log("setClothingInputTool: Sending analysis via realtime:", analysisResult);

      // Send via realtime channel - use same channel name as useGlobalSubscription
      const channelName = `ui-updates-${user.id}`;
      const channel = supabase.channel(channelName);
      await channel.send({
        type: 'broadcast',
        event: 'clothing_analysis_update',
        payload: analysisResult
      });
      
      console.log(`setClothingInputTool: Sent to channel: ${channelName}`);

      return `setClothingInputTool: Successfully updated clothing analysis UI with ${matched_layers.length} matched layers and ${proposed_layers.length} proposed layers.`;

    } catch (error: unknown) {
      console.error("setClothingInputTool: error:", error);
      return `setClothingInputTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
