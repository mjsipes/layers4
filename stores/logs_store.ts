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
  outfit?: Tables<"outfit"> & {
    layers: Tables<"layer">[];
  };
  weather?: Tables<"weather">;
};

type LogState = {
  logs: Log[];
  setLogs: (logs: Log[]) => void;
  addLog: (log: {
    feedback?: string;
    comfort_level?: number;
    date?: string;
    outfit_id?: string;
    weather_id?: string;
  }) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

let isSubscribed = false;
let channel: any = null;

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
          if (userError) console.error("🔴 [LOGS] Error getting user:", userError);
          else console.log("🟢 [LOGS] User data:", { id: user?.id });

          /* 2. Insert log */
          const insertData = {
            feedback: logData.feedback ?? null,
            comfort_level: logData.comfort_level ?? null,
            date: logData.date ?? null,
            outfit_id: logData.outfit_id ?? null,
            weather_id: logData.weather_id ?? null,
            user_id: user?.id ?? null,
          };
          console.log("🔵 [LOGS] Inserting:", insertData);

          const { error } = await supabase.from("log").insert(insertData);

          if (error) throw error;
          console.log("🟢 [LOGS] Log inserted successfully");
        } catch (err) {
          console.error("🔴 [LOGS] Failed to add log:", err);
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
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const fetchLogs = async () => {
  const { data, error } = await supabase
    .from("log")
    .select(`
      *,
      outfit:outfit_id (
        *,
        outfit_layer (
          layer(*)
        )
      ),
      weather:weather_id (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("🔴 [LOGS] Fetch error:", error);
    useLogStore.getState().setLogs([]);
    return [];
  }

  console.log("🟢 [LOGS] Raw data:", data);

  const logsWithRelations: Log[] =
    data?.map((log: any) => ({
      ...log,
      outfit: log.outfit
        ? {
            ...log.outfit,
            layers: log.outfit.outfit_layer?.map((ol: any) => ol.layer) ?? [],
          }
        : undefined,
    })) ?? [];

  useLogStore.getState().setLogs(logsWithRelations);
  return logsWithRelations;
};

/* ------------------------------------------------------------------ */
/* Live-query initialization                                           */
/* ------------------------------------------------------------------ */

const initializeStore = async () => {
  if (isSubscribed) return;

  try {
    await fetchLogs();

    channel = supabase
      .channel("logs-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "log" },
        async (payload) => {
          console.log("🔵 [LOGS] Subscription triggered:", payload);
          await fetchLogs();
        }
      )
      .subscribe();

    isSubscribed = true;
  } catch (err) {
    console.error("🔴 [LOGS] Init error:", err);
    useLogStore.getState().setLogs([]);
  }
};

initializeStore();

/* ------------------------------------------------------------------ */
/* Cleanup                                                             */
/* ------------------------------------------------------------------ */

export const cleanupLogsStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export type { Log };
