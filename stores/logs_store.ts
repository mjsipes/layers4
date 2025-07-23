// /stores/logs_store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Log = Tables<"log"> & {
  layers?: Tables<"layer">[];
  weather?: Tables<"weather">;
};

type LogState = {
  logs: Log[];
  setLogs: (logs: Log[]) => void;
  addLog: (log: {
    feedback?: string;
    comfort_level?: number;
    date?: string;
    weather_id?: string;
    layer_ids?: string[];
  }) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const useLogStore = create<LogState>()(
  devtools(
    (set) => ({
      logs: [],

      setLogs: (logs) => set({ logs }),

      addLog: async (logData) => {
        try {
          /* 1. Get user */
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) console.error("\ud83d\udd34 [LOGS] Error getting user:", userError);
          else console.log("\ud83d\udfe2 [LOGS] User data:", { id: user?.id });

          /* 2. Insert log */
          const insertData = {
            feedback: logData.feedback ?? null,
            comfort_level: logData.comfort_level ?? null,
            date: logData.date ?? null,
            weather_id: logData.weather_id ?? null,
            user_id: user?.id ?? null,
          };
          console.log("\ud83d\udd35 [LOGS] Inserting:", insertData);

          const { data: insertedLog, error } = await supabase.from("log").insert(insertData).select().single();

          if (error) throw error;
          console.log("\ud83d\udfe2 [LOGS] Log inserted successfully");

          /* 3. Insert into log_layer join table */
          if (logData.layer_ids && logData.layer_ids.length > 0) {
            const logLayerRows = logData.layer_ids.map((layer_id) => ({
              log_id: insertedLog.id,
              layer_id,
            }));
            const { error: joinError } = await supabase.from("log_layer").insert(logLayerRows);
            if (joinError) throw joinError;
            console.log("\ud83d\udfe2 [LOGS] log_layer join rows inserted");
          }
        } catch (err) {
          console.error("\ud83d\udd34 [LOGS] Failed to add log:", err);
          throw err;
        }
      },

      deleteLog: async (logId) => {
        try {
          console.log("🔵 [LOGS] Deleting log:", logId);

          const { data, error } = await supabase
            .from("log")
            .delete()
            .eq("id", logId)
            .select();

          if (error) throw error;
          console.log("🟢 [LOGS] Deleted:", data);
        } catch (err) {
          console.error("🔴 [LOGS] Failed to delete log:", err);
          throw err;
        }
      },
    }),
    { name: "📓 Log Store" }
  )
);

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export type { Log };
