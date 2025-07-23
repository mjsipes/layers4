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
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [LOGS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [LOGS] User data received:", { id: user.id });

      const { data: logs, error: fetchError } = await supabase
        .from("log")
        .select(`
          *,
          log_layer:log_layer(*, layer:layer_id(*)),
          weather:weather_id (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("🔴 [LOGS] Error fetching logs:", fetchError);
        return `❌ Failed to fetch logs: ${fetchError.message}`;
      }

      if (!logs || logs.length === 0) {
        return "📝 No logs found in your wardrobe";
      }

      // Map layers for each log
      const logsWithLayers = logs.map((log: Tables<"log"> & { log_layer?: Array<{ layer: Tables<"layer"> }> }) => ({
        ...log,
        layers: log.log_layer?.map((ll: { layer: Tables<"layer"> }) => ll.layer) ?? [],
      }));

      console.log("🟢 [LOGS] Logs fetched successfully:", logsWithLayers);
      return `📓 Found ${logsWithLayers.length} log(s) in your wardrobe:\n${JSON.stringify(logsWithLayers, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [LOGS] Failed to fetch logs:", error);
      return `⚠️ Failed to fetch logs: ${
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
  }),
  execute: async ({ feedback, comfort_level, date, weather_id, layer_ids }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [LOGS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [LOGS] User data received:", { id: user.id });

      const insertData = {
        feedback: feedback || null,
        comfort_level: comfort_level || null,
        date: date || null,
        weather_id: weather_id || null,
        user_id: user.id,
      };

      console.log("🔵 [LOGS] Inserting log data:", insertData);

      const { data: newLog, error: createError } = await supabase
        .from("log")
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        console.error("🔴 [LOGS] Error creating log:", createError);
        return `❌ Failed to create log: ${createError.message}`;
      }

      // Insert into log_layer join table
      if (layer_ids && layer_ids.length > 0) {
        const logLayerRows = layer_ids.map((layer_id: string) => ({
          log_id: newLog.id,
          layer_id,
        }));
        const { error: joinError } = await supabase.from("log_layer").insert(logLayerRows);
        if (joinError) {
          console.error("🔴 [LOGS] Error creating log_layer join rows:", joinError);
          return `❌ Failed to link layers: ${joinError.message}`;
        }
        console.log("🟢 [LOGS] log_layer join rows inserted");
      }

      console.log("🟢 [LOGS] Log inserted successfully:", newLog);
      return `✅ Successfully created log: ${JSON.stringify(newLog, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [LOGS] Failed to create log:", error);
      return `⚠️ Failed to create log: ${
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
    // Optionally, you could add layer_ids here for updating layers
  }),
  execute: async ({ id, feedback, comfort_level, date, weather_id }) => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [LOGS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [LOGS] User data received:", { id: user.id });

      // Build update data object with only provided fields
      const updateData: TablesUpdate<"log"> = {};
      if (feedback !== undefined) updateData.feedback = feedback;
      if (comfort_level !== undefined) updateData.comfort_level = comfort_level;
      if (date !== undefined) updateData.date = date;
      if (weather_id !== undefined) updateData.weather_id = weather_id;

      if (Object.keys(updateData).length === 0) {
        return `❌ No fields provided to update. Please provide at least one field (feedback, comfort_level, date, or weather_id).`;
      }

      console.log("🔵 [LOGS] Updating log data:", { id, updateData });

      const { data: updatedLog, error: updateError } = await supabase
        .from("log")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id) // Ensure user can only update their own logs
        .select()
        .single();

      if (updateError) {
        console.error("🔴 [LOGS] Error updating log:", updateError);
        return `❌ Failed to update log: ${updateError.message}`;
      }

      if (!updatedLog) {
        return `❌ Log with ID ${id} not found or you don't have permission to update it.`;
      }

      console.log("🟢 [LOGS] Log updated successfully:", updatedLog);
      return `✅ Successfully updated log: ${JSON.stringify(updatedLog, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [LOGS] Failed to update log:", error);
      return `⚠️ Failed to update log: ${
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
      const supabase = await createClient();

      console.log("🔵 [LOGS] Attempting to delete log with ID:", id);

      const { error: deleteError } = await supabase
        .from("log")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("🔴 [LOGS] Error deleting log:", deleteError);
        return `❌ Failed to delete log: ${deleteError.message}`;
      }

      console.log("🟢 [LOGS] Log deleted successfully:", id);
      return `✅ Successfully deleted log with ID: ${id}`;
    } catch (error: unknown) {
      console.error("🔴 [LOGS] Failed to delete log:", error);
      return `⚠️ Failed to delete log: ${
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
    console.log(`[LOGS] Linking layer to log:`, { log_id, layer_id });
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [LOGS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [LOGS] User data received:", { id: user.id });

      // Verify that both the log and layer belong to the user
      const { data: log, error: logError } = await supabase
        .from("log")
        .select("id")
        .eq("id", log_id)
        .eq("user_id", user.id)
        .single();

      if (logError || !log) {
        console.error("🔴 [LOGS] Error verifying log:", logError);
        return `❌ Log with ID ${log_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();
      console.log("[LOGS] Layer fetch result:", { layer, layerError });

      if (layerError || !layer) {
        console.error("🔴 [LOGS] Error verifying layer:", layerError);
        return `❌ Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      // Check if the link already exists
      const { data: existingLink, error: checkError } = await supabase
        .from("log_layer")
        .select("id")
        .eq("log_id", log_id)
        .eq("layer_id", layer_id)
        .single();
      console.log("[LOGS] Existing link fetch result:", { existingLink, checkError });

      if (existingLink) {
        return `⚠️ Layer ${layer_id} is already linked to log ${log_id}.`;
      }

      const { data: newLink, error: linkError } = await supabase
        .from("log_layer")
        .insert({
          log_id: log_id,
          layer_id: layer_id,
        })
        .select()
        .single();
      console.log("[LOGS] New link result:", { newLink, linkError });

      if (linkError) {
        console.error("🔴 [LOGS] Error linking layer to log:", linkError);
        return `❌ Failed to link layer to log: ${linkError.message}`;
      }

      console.log("🟢 [LOGS] Layer linked to log successfully:", newLink);
      return `✅ Successfully linked layer ${layer_id} to log ${log_id}`;
    } catch (error: unknown) {
      console.error("🔴 [LOGS] Failed to link layer to log:", error);
      return `⚠️ Failed to link layer to log: ${
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

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [LOGS] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [LOGS] User data received:", { id: user.id });

      // Verify that both the log and layer belong to the user
      const { data: log, error: logError } = await supabase
        .from("log")
        .select("id")
        .eq("id", log_id)
        .eq("user_id", user.id)
        .single();

      if (logError || !log) {
        console.error("🔴 [LOGS] Error verifying log:", logError);
        return `❌ Log with ID ${log_id} not found or you don't have permission to access it.`;
      }

      const { data: layer, error: layerError } = await supabase
        .from("layer")
        .select("id")
        .eq("id", layer_id)
        .eq("user_id", user.id)
        .single();

      if (layerError || !layer) {
        console.error("🔴 [LOGS] Error verifying layer:", layerError);
        return `❌ Layer with ID ${layer_id} not found or you don't have permission to access it.`;
      }

      console.log("🔵 [LOGS] Unlinking layer from log:", { log_id, layer_id });

      const { error: unlinkError } = await supabase
        .from("log_layer")
        .delete()
        .eq("log_id", log_id)
        .eq("layer_id", layer_id);

      if (unlinkError) {
        console.error("🔴 [LOGS] Error unlinking layer from log:", unlinkError);
        return `❌ Failed to unlink layer from log: ${unlinkError.message}`;
      }

      console.log("🟢 [LOGS] Layer unlinked from log successfully");
      return `✅ Successfully unlinked layer ${layer_id} from log ${log_id}`;
    } catch (error: unknown) {
      console.error("🔴 [LOGS] Failed to unlink layer from log:", error);
      return `⚠️ Failed to unlink layer from log: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
}); 