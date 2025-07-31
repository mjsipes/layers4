import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { TablesUpdate } from "@/lib/supabase/database.types";
import { Tables } from "@/lib/supabase/database.types";

export const selectLogsTool = tool({
  description: "Get all logs from the database for the authenticated user",
  parameters: z.object({}),
  execute: async () => {
    try {
      console.log("selectLogsTool: Executing");
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("selectLogsTool: Error getting user:", userError);
        return `selectLogsTool: Authentication error: ${userError.message}`;
      }
      if (!user) {
        console.error("selectLogsTool: No authenticated user found");
        return `selectLogsTool: No authenticated user found.`;
      }

      console.log("selectLogsTool: User data received:", { id: user.id });
      const { data: logs, error: fetchError } = await supabase
        .from("log")
        .select(`
          *,
          log_layer:log_layer(*, layer:layer_id(*)),
          log_layer_recs:log_layer_recs(*, layer:layer_id(*)),
          weather:weather_id (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("selectLogsTool: Error fetching logs:", fetchError);
        return `selectLogsTool: Failed to fetch logs: ${fetchError.message}`;
      }

      if (!logs || logs.length === 0) {
        console.log("selectLogsTool: No logs found in your wardrobe");
        return "selectLogsTool: No logs found in your wardrobe";
      }

      const logsWithLayers = logs.map((log: Tables<"log"> & { 
        log_layer?: Array<{ layer: Tables<"layer"> }>,
        log_layer_recs?: Array<{ layer: Tables<"layer"> }>
      }) => ({
        ...log,
        layers: log.log_layer?.map((ll: { layer: Tables<"layer"> }) => ll.layer) ?? [],
        recommendedLayers: log.log_layer_recs?.map((llr: { layer: Tables<"layer"> }) => llr.layer) ?? [],
      }));

      console.log("selectLogsTool: Logs fetched successfully:", logsWithLayers);
      return `selectLogsTool: Found ${logsWithLayers.length} log(s) in your wardrobe:\n${JSON.stringify(logsWithLayers, null, 2)}`;
    } catch (error: unknown) {
      console.error("selectLogsTool: error:", error);
      return `selectLogsTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const insertLogTool = tool({
  description: "Create a new log entry in the database",
  parameters: z.object({
    feedback: z.string().optional().describe("Feedback about the log experience"),
    comfort_level: z.number().min(1).max(10).optional().describe("Comfort level from 1-10"),
    date: z.string().optional().describe("Date of the log entry (YYYY-MM-DD format)"),
    weather_id: z.string().optional().describe("ID of the weather data for this log"),
    layer_ids: z.array(z.string()).optional().describe("Array of layer IDs to link to this log"),
    latitude: z.number().optional().describe("Latitude coordinate for the log location"),
    longitude: z.number().optional().describe("Longitude coordinate for the log location"),
  }),
  execute: async ({ feedback, comfort_level, date, weather_id, layer_ids, latitude, longitude }) => {
    try {
      console.log("insertLogTool: Executing with:", { feedback, comfort_level, date, weather_id, layer_ids, latitude, longitude });
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("insertLogTool: Error getting user:", userError);
        return `insertLogTool: Authentication error: ${userError.message}`;
      }

      if (!user) {
        console.error("insertLogTool: No authenticated user found");
        return `insertLogTool: No authenticated user found.`;
      }

      console.log("insertLogTool: User data received:", { id: user.id });

      const insertData = {
        feedback: feedback || null,
        comfort_level: comfort_level || null,
        date: date || null,
        weather_id: weather_id || null,
        latitude: latitude || null,
        longitude: longitude || null,
        user_id: user.id,
      };

      console.log("insertLogTool: Inserting log data:", insertData);

      const { data: newLog, error: createError } = await supabase
        .from("log")
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        console.error("insertLogTool: Error creating log:", createError);
        return `insertLogTool: Failed to create log: ${createError.message}`;
      }

      if (layer_ids && layer_ids.length > 0) {
        const logLayerRows = layer_ids.map((layer_id: string) => ({
          log_id: newLog.id,
          layer_id,
        }));
        const { error: joinError } = await supabase.from("log_layer").insert(logLayerRows);
        if (joinError) {
            console.error("insertLogTool: Error creating log_layer join rows:", joinError);
          return `insertLogTool: Failed to link layers: ${joinError.message}`;
        }
        console.log("insertLogTool: log_layer join rows inserted");
      }

      console.log("insertLogTool: Log inserted successfully:", newLog);
      return `insertLogTool: Successfully created log: ${JSON.stringify(newLog, null, 2)}`;
    } catch (error: unknown) {
      console.error("insertLogTool: error:", error);
      return `insertLogTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const updateLogTool = tool({
  description: "Update an existing log entry in the database",
  parameters: z.object({
    id: z.string().describe("ID of the log to update"),
    feedback: z.string().optional().describe("New feedback about the log experience"),
    comfort_level: z.number().min(1).max(10).optional().describe("New comfort level from 1-10"),
    date: z.string().optional().describe("New date of the log entry (YYYY-MM-DD format)"),
    weather_id: z.string().optional().describe("New weather ID"),
    latitude: z.number().optional().describe("New latitude coordinate for the log location"),
    longitude: z.number().optional().describe("New longitude coordinate for the log location"),
    // Optionally, you could add layer_ids here for updating layers
  }),
  execute: async ({ id, feedback, comfort_level, date, weather_id, latitude, longitude }) => {
    try {
      console.log("updateLogTool: Executing with:", { id, feedback, comfort_level, date, weather_id, latitude, longitude });
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("updateLogTool: Error getting user:", userError);
        return `updateLogTool: Authentication error: ${userError.message}`;
      }

      if (!user) {
        console.error("updateLogTool: No authenticated user found");
        return `updateLogTool: No authenticated user found.`;
      }

      console.log("updateLogTool: User data received:", { id: user.id });

      const updateData: TablesUpdate<"log"> = {};
      if (feedback !== undefined) updateData.feedback = feedback;
      if (comfort_level !== undefined) updateData.comfort_level = comfort_level;
      if (date !== undefined) updateData.date = date;
      if (weather_id !== undefined) updateData.weather_id = weather_id;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;

      if (Object.keys(updateData).length === 0) {
        console.error("updateLogTool: No fields provided to update");
        return `updateLogTool: No fields provided to update.`;
      }

      console.log("updateLogTool: Updating log data:", { id, updateData });

      const { data: updatedLog, error: updateError } = await supabase
        .from("log")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("updateLogTool: Error updating log:", updateError);
        return `updateLogTool: Failed to update log: ${updateError.message}`;
      }

      if (!updatedLog) {
        console.error("updateLogTool: Log with ID ${id} not found or you don't have permission to update it.");
        return `updateLogTool: Log with ID ${id} not found or you don't have permission to update it.`;
      }

      console.log("updateLogTool: Log updated successfully:", updatedLog);
      return `updateLogTool: Successfully updated log: ${JSON.stringify(updatedLog, null, 2)}`;
    } catch (error: unknown) {
      console.error("updateLogTool: error:", error);
      return `updateLogTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const deleteLogTool = tool({
  description: "Delete a log entry from the database by its ID",
  parameters: z.object({
    id: z.string().describe("ID of the log to delete"),
  }),
  execute: async ({ id }) => {
    try {
      console.log("deleteLogTool: Executing with:", { id });
      const supabase = await createClient();
      const { error: deleteError } = await supabase
        .from("log")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("deleteLogTool: Error deleting log:", deleteError);
        return `deleteLogTool: Failed to delete log: ${deleteError.message}`;
      }

      console.log("deleteLogTool: Log deleted successfully:", id);
      return `deleteLogTool: Successfully deleted log with ID: ${id}`;
    } catch (error: unknown) {
      console.error("deleteLogTool: error:", error);
      return `deleteLogTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const linkLogLayerTool = tool({
  description: "Link a layer to a log by creating a record in the log_layer join table. Use this when the user wants to add a layer to a log.",
  parameters: z.object({
    log_id: z.string().describe("ID of the log to link the layer to"),
    layer_id: z.string().describe("ID of the layer to link to the log"),
  }),
  execute: async ({ log_id, layer_id }) => {
    try {
      console.log("linkLogLayerTool: Executing with:", { log_id, layer_id });
      const supabase = await createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("linkLogLayerTool: Error getting user:", userError);
        return `linkLogLayerTool: Authentication error: ${userError.message}`;
      }

      if (!user) {
        console.error("linkLogLayerTool: No authenticated user found");
        return `linkLogLayerTool: No authenticated user found.`;
      }

      console.log("linkLogLayerTool: User data received:", { id: user.id });

      const { data: log, error: logError } = await supabase
        .from("log")
        .select("id")
        .eq("id", log_id)
        .eq("user_id", user.id)
        .single();

      if (logError || !log) {
        console.error("linkLogLayerTool: Error verifying log:", logError);
        return `linkLogLayerTool: Log with ID ${log_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();
      console.log("linkLogLayerTool: Layer fetch result:", { layer, layerError });

      if (layerError || !layer) {
        console.error("linkLogLayerTool: Error verifying layer:", layerError);
        return `linkLogLayerTool: Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      const { data: existingLink, error: checkError } = await supabase
        .from("log_layer")
        .select("id")
        .eq("log_id", log_id)
        .eq("layer_id", layer_id)
        .single();
      console.log("linkLogLayerTool: Existing link fetch result:", { existingLink, checkError });

      if (existingLink) {
        console.error("linkLogLayerTool: Layer ${layer_id} is already linked to log ${log_id}.");
        return `linkLogLayerTool: Layer ${layer_id} is already linked to log ${log_id}.`;
      }

      const { data: newLink, error: linkError } = await supabase
        .from("log_layer")
        .insert({
          log_id: log_id,
          layer_id: layer_id,
        })
        .select()
        .single();
      console.log("linkLogLayerTool: New link result:", { newLink, linkError });

      if (linkError) {
        console.error("linkLogLayerTool: Error linking layer to log:", linkError);
        return `linkLogLayerTool: Failed to link layer to log: ${linkError.message}`;
      }

      console.log("linkLogLayerTool: Layer linked to log successfully:", newLink);
      return `linkLogLayerTool: Successfully linked layer ${layer_id} to log ${log_id}`;
    } catch (error: unknown) {
      console.error("linkLogLayerTool: error:", error);
      return `linkLogLayerTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const unlinkLogLayerTool = tool({
  description: "Unlink a layer from a log by removing the record from the log_layer join table. Use this when the user wants to remove a layer from a log.",
  parameters: z.object({
    log_id: z.string().describe("ID of the log to unlink the layer from"),
    layer_id: z.string().describe("ID of the layer to unlink from the log"),
  }),
  execute: async ({ log_id, layer_id }) => {
    try {
      const supabase = await createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("unlinkLogLayerTool: Error getting user:", userError);
        return `unlinkLogLayerTool: Authentication error: ${userError.message}`;
      }

      if (!user) {
        console.error("unlinkLogLayerTool: No authenticated user found");
        return `unlinkLogLayerTool: No authenticated user found.`;
      }

      console.log("unlinkLogLayerTool: User data received:", { id: user.id });

      const { data: log, error: logError } = await supabase
        .from("log")
        .select("id")
        .eq("id", log_id)
        .eq("user_id", user.id)
        .single();

      if (logError || !log) {
        console.error("unlinkLogLayerTool: Error verifying log:", logError);
        return `unlinkLogLayerTool: Log with ID ${log_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();

      if (layerError || !layer) {
        console.error("unlinkLogLayerTool: Error verifying layer:", layerError);
        return `unlinkLogLayerTool: Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      console.log("unlinkLogLayerTool: Unlinking layer from log:", { log_id, layer_id });

      const { error: unlinkError } = await supabase
        .from("log_layer")
        .delete()
        .eq("log_id", log_id)
        .eq("layer_id", layer_id);

      if (unlinkError) {
        console.error("unlinkLogLayerTool: Error unlinking layer from log:", unlinkError);
        return `unlinkLogLayerTool: Failed to unlink layer from log: ${unlinkError.message}`;
      }

      console.log("unlinkLogLayerTool: Layer unlinked from log successfully");
      return `unlinkLogLayerTool: Successfully unlinked layer ${layer_id} from log ${log_id}`;
    } catch (error: unknown) {
      console.error("unlinkLogLayerTool: error:", error);
      return `⚠️ Failed to unlink layer from log: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },

}); 

export const linkLogLayerRecTool = tool({
  description: "Link a layer to a log as a recommendation by creating a record in the log_layer_recs join table. Use this when the user wants to add a layer recommendation to a log.",
  parameters: z.object({
    log_id: z.string().describe("ID of the log to link the layer recommendation to"),
    layer_id: z.string().describe("ID of the layer to link as a recommendation to the log"),
  }),
  execute: async ({ log_id, layer_id }) => {
    try {
      console.log("linkLogLayerRecTool: Executing with:", { log_id, layer_id });
      const supabase = await createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("linkLogLayerRecTool: Error getting user:", userError);
        return `linkLogLayerRecTool: Authentication error: ${userError.message}`;
      }

      if (!user) {
        console.error("linkLogLayerRecTool: No authenticated user found");
        return `linkLogLayerRecTool: No authenticated user found.`;
      }

      console.log("linkLogLayerRecTool: User data received:", { id: user.id });

      const { data: log, error: logError } = await supabase
        .from("log")
        .select("id")
        .eq("id", log_id)
        .eq("user_id", user.id)
        .single();

      if (logError || !log) {
        console.error("linkLogLayerRecTool: Error verifying log:", logError);
        return `linkLogLayerRecTool: Log with ID ${log_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();
      console.log("linkLogLayerRecTool: Layer fetch result:", { layer, layerError });

      if (layerError || !layer) {
        console.error("linkLogLayerRecTool: Error verifying layer:", layerError);
        return `linkLogLayerRecTool: Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      const { data: existingLink, error: checkError } = await supabase
        .from("log_layer_recs")
        .select("id")
        .eq("log_id", log_id)
        .eq("layer_id", layer_id)
        .single();
      console.log("linkLogLayerRecTool: Existing link fetch result:", { existingLink, checkError });

      if (existingLink) {
        console.error("linkLogLayerRecTool: Layer ${layer_id} is already linked as a recommendation to log ${log_id}.");
        return `linkLogLayerRecTool: Layer ${layer_id} is already linked as a recommendation to log ${log_id}.`;
      }

      const { data: newLink, error: linkError } = await supabase
        .from("log_layer_recs")
        .insert({
          log_id: log_id,
          layer_id: layer_id,
        })
        .select()
        .single();
      console.log("linkLogLayerRecTool: New link result:", { newLink, linkError });

      if (linkError) {
        console.error("linkLogLayerRecTool: Error linking layer recommendation to log:", linkError);
        return `linkLogLayerRecTool: Failed to link layer recommendation to log: ${linkError.message}`;
      }

      console.log("linkLogLayerRecTool: Layer recommendation linked to log successfully:", newLink);
      return `linkLogLayerRecTool: Successfully linked layer ${layer_id} as a recommendation to log ${log_id}`;
    } catch (error: unknown) {
      console.error("linkLogLayerRecTool: error:", error);
      return `linkLogLayerRecTool: error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});

export const unlinkLogLayerRecTool = tool({
  description: "Unlink a layer recommendation from a log by removing the record from the log_layer_recs join table. Use this when the user wants to remove a layer recommendation from a log.",
  parameters: z.object({
    log_id: z.string().describe("ID of the log to unlink the layer recommendation from"),
    layer_id: z.string().describe("ID of the layer recommendation to unlink from the log"),
  }),
  execute: async ({ log_id, layer_id }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("unlinkLogLayerRecTool: Error getting user:", userError);
        return `unlinkLogLayerRecTool: Authentication error: ${userError.message}`;
      }

      if (!user) {
        console.error("unlinkLogLayerRecTool: No authenticated user found");
        return `unlinkLogLayerRecTool: No authenticated user found.`;
      }

      console.log("unlinkLogLayerRecTool: User data received:", { id: user.id });

      const { data: log, error: logError } = await supabase
        .from("log")
        .select("id")
        .eq("id", log_id)
        .eq("user_id", user.id)
        .single();

      if (logError || !log) {
        console.error("unlinkLogLayerRecTool: Error verifying log:", logError);
        return `unlinkLogLayerRecTool: Log with ID ${log_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();

      if (layerError || !layer) {
        console.error("unlinkLogLayerRecTool: Error verifying layer:", layerError);
        return `unlinkLogLayerRecTool: Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      console.log("unlinkLogLayerRecTool: Unlinking layer recommendation from log:", { log_id, layer_id });

      const { error: unlinkError } = await supabase
        .from("log_layer_recs")
        .delete()
        .eq("log_id", log_id)
        .eq("layer_id", layer_id);

      if (unlinkError) {
        console.error("unlinkLogLayerRecTool: Error unlinking layer recommendation from log:", unlinkError);
        return `unlinkLogLayerRecTool: Failed to unlink layer recommendation from log: ${unlinkError.message}`;
      }

      console.log("unlinkLogLayerRecTool: Layer recommendation unlinked from log successfully");
      return `unlinkLogLayerRecTool: Successfully unlinked layer ${layer_id} recommendation from log ${log_id}`;
    } catch (error: unknown) {
      console.error("unlinkLogLayerRecTool: error:", error);
      return `⚠️ Failed to unlink layer recommendation from log: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
}); 