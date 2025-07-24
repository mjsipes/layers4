// /stores/logs_store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { useLayerStore } from "@/stores/layers_store";

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
    lat?: number;
    lon?: number;
    address?: string;
    city?: string;
  }) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  updateLog: (logId: string, updates: Partial<Omit<Log, 'id'>>) => Promise<void>;
  linkLayerToLog: (logId: string, layerId: string) => Promise<void>;
  unlinkLayerFromLog: (logId: string, layerId: string) => Promise<void>;
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
        console.log("logs_store.addLog:Adding log:", logData);
        try {
          /* 1. Get user */
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) console.error("logs_store/addLog: Error getting user:", userError);
          else console.log("logs_store/addLog: User data:", { id: user?.id });

          /* 2. Insert log */
          const insertData = {
            feedback: logData.feedback ?? null,
            comfort_level: logData.comfort_level ?? null,
            date: logData.date ?? null,
            weather_id: logData.weather_id ?? null,
            user_id: user?.id ?? null,
            latitude: logData.lat ?? null,
            longitude: logData.lon ?? null,
            address: logData.address ?? null,
            city: logData.city ?? null,
          };
          console.log("logs_store/addLog: Inserting:", insertData);

          const { data: insertedLog, error } = await supabase.from("log").insert(insertData).select().single();

          if (error) throw error;
          console.log("logs_store/addLog: Log inserted successfully");

          /* 3. Insert into log_layer join table */
          if (logData.layer_ids && logData.layer_ids.length > 0) {
            const logLayerRows = logData.layer_ids.map((layer_id) => ({
              log_id: insertedLog.id,
              layer_id,
            }));
            const { error: joinError } = await supabase.from("log_layer").insert(logLayerRows);
            if (joinError) throw joinError;
            console.log("logs_store/addLog: log_layer join rows inserted");
          }
        } catch (err) {
          console.error("logs_store/addLog: Failed to add log:", err);
          throw err;
        }
      },

      deleteLog: async (logId) => {
        try {
          console.log("logs_store/deleteLog: Deleting log:", logId);

          const { data, error } = await supabase
            .from("log")
            .delete()
            .eq("id", logId)
            .select();

          if (error) throw error;
          console.log("logs_store/deleteLog: Deleted:", data);
        } catch (err) {
          console.error("logs_store/deleteLog: Failed to delete log:", err);
          throw err;
        }
      },

      updateLog: async (logId, updates) => {
        try {
          console.log("logs_store/updateLog: Updating log:", logId, updates);
          const { data, error } = await supabase
            .from("log")
            .update(updates)
            .eq("id", logId)
            .select()
            .single();
          if (error) throw error;
          set((state) => ({
            logs: state.logs.map((log) =>
              log.id === logId ? { ...log, ...updates } : log
            ),
          }));
          console.log("logs_store/updateLog: Updated:", data);
        } catch (err) {
          console.error("logs_store/updateLog: Failed to update log:", err);
          throw err;
        }
      },

      linkLayerToLog: async (logId, layerId) => {
        try {
          console.log("logs_store/linkLayerToLog: Linking layer to log:", logId, layerId);
          const { data, error } = await supabase
            .from("log_layer")
            .insert({ log_id: logId, layer_id: layerId })
            .select()
            .single();
          if (error) throw error;
          // Get the full layer object from the global layers store
          const allLayers = useLayerStore.getState().layers;
          const fullLayer = allLayers.find((l) => l.id === layerId) || {
            id: layerId,
            name: null,
            description: null,
            warmth: null,
            user_id: null,
            created_at: '',
            top: null,
            bottom: null
          };
          set((state) => ({
            logs: state.logs.map((log) =>
              log.id === logId && log.layers
                ? { ...log, layers: [...log.layers, fullLayer] }
                : log
            ),
          }));
          console.log("logs_store/linkLayerToLog: Linked:", data);
        } catch (err) {
          console.error("logs_store/linkLayerToLog: Failed to link layer:", err);
          throw err;
        }
      },

      unlinkLayerFromLog: async (logId, layerId) => {
        try {
          console.log("logs_store/unlinkLayerFromLog: Unlinking layer from log:", logId, layerId);
          const { data, error } = await supabase
            .from("log_layer")
            .delete()
            .eq("log_id", logId)
            .eq("layer_id", layerId)
            .select();
          if (error) throw error;
          set((state) => ({
            logs: state.logs.map((log) =>
              log.id === logId && log.layers
                ? { ...log, layers: log.layers.filter((layer) => layer.id !== layerId) }
                : log
            ),
          }));
          console.log("logs_store/unlinkLayerFromLog: Unlinked:", data);
        } catch (err) {
          console.error("logs_store/unlinkLayerFromLog: Failed to unlink layer:", err);
          throw err;
        }
      },
    }),
    { name: "logs-store" }
  )
);

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export type { Log };
