import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
          outfit:outfit_id (*),
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

      console.log("🟢 [LOGS] Logs fetched successfully:", logs);
      return `📓 Found ${logs.length} log(s) in your wardrobe:\n${JSON.stringify(logs, null, 2)}`;
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
    feedback: z.string().optional().describe("Feedback about the outfit experience"),
    comfort_level: z.number().min(1).max(10).optional().describe("Comfort level from 1-10"),
    date: z.string().optional().describe("Date of the log entry (YYYY-MM-DD format)"),
    outfit_id: z.string().optional().describe("ID of the outfit worn"),
    weather_id: z.string().optional().describe("ID of the weather data for this log"),
  }),
  execute: async ({ feedback, comfort_level, date, outfit_id, weather_id }) => {
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
        outfit_id: outfit_id || null,
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
    feedback: z.string().optional().describe("New feedback about the outfit experience"),
    comfort_level: z.number().min(1).max(10).optional().describe("New comfort level from 1-10"),
    date: z.string().optional().describe("New date of the log entry (YYYY-MM-DD format)"),
    outfit_id: z.string().optional().describe("New outfit ID"),
    weather_id: z.string().optional().describe("New weather ID"),
  }),
  execute: async ({ id, feedback, comfort_level, date, outfit_id, weather_id }) => {
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
      const updateData: any = {};
      if (feedback !== undefined) updateData.feedback = feedback;
      if (comfort_level !== undefined) updateData.comfort_level = comfort_level;
      if (date !== undefined) updateData.date = date;
      if (outfit_id !== undefined) updateData.outfit_id = outfit_id;
      if (weather_id !== undefined) updateData.weather_id = weather_id;

      if (Object.keys(updateData).length === 0) {
        return `❌ No fields provided to update. Please provide at least one field (feedback, comfort_level, date, outfit_id, or weather_id).`;
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