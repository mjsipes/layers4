// /stores/logs_store.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/supabase/database.types';

const supabase = createClient();

type Log = Tables<'log'> & {
  outfit?: Tables<'outfit'> & {
    layers: Tables<'layer'>[];
  };
  weather?: Tables<'weather'>;
};

type LogState = {
  logs: Log[];
  addLog: (log: { 
    feedback?: string; 
    comfort_level?: number; 
    date?: string;
    outfit_id?: string;
    weather_id?: string;
  }) => Promise<void>;
};

// Global state to track subscription
let isSubscribed = false;
let channel: any = null;

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  addLog: async (logData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("🔴 [LOGS] Error getting user:", userError);
      } else {
        console.log("🟢 [LOGS] User data received:", { id: user?.id });
      }
      const insertData = {
        feedback: logData.feedback || null,
        comfort_level: logData.comfort_level || null,
        date: logData.date || null,
        outfit_id: logData.outfit_id || null,
        weather_id: logData.weather_id || null,
        user_id: user?.id || null,
      };
      console.log("🔵 [LOGS] Inserting log data:", insertData);
      const { error } = await supabase
        .from("log")
        .insert(insertData);
      if (error) {
        console.error("🔴 [LOGS] Error adding log:", error);
        throw error;
      } else {
        console.log("🟢 [LOGS] Log inserted successfully");
      }
    } catch (error) {
      console.error("🔴 [LOGS] Failed to add log:", error);
      throw error;
    }
  },
}));

export const fetchLogs = async () => {
  const { data, error } = await supabase
    .from("log")
    .select(`
      *,
      outfit:outfit_id (
        *,
        outfit_layer(
          layer(*)
        )
      ),
      weather:weather_id (*)
    `)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("🔴 [LOGS] Error fetching logs:", error);
    useLogStore.setState({ logs: [] });
    return [];
  }
  console.log("🟢 [LOGS] Raw data received:", data);
  const logsWithRelations = data?.map(log => ({
    ...log,
    outfit: log.outfit ? {
      ...log.outfit,
      layers: log.outfit.outfit_layer?.map((ol: any) => ol.layer) || []
    } : undefined
  })) || [];
  useLogStore.setState({ logs: logsWithRelations });
  return logsWithRelations;
};

const initializeStore = async () => {
  if (isSubscribed) {
    return;
  }
  try {
    await fetchLogs();
    channel = supabase
      .channel("logs-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "log",
        },
        async (payload) => {
          console.log("🔵 [LOGS] Subscription triggered:", payload);
          await fetchLogs();
        }
      )
      .subscribe();
    isSubscribed = true;
  } catch (error) {
    console.error("🔴 [LOGS] Error initializing logs store:", error);
    useLogStore.setState({ logs: [] });
  }
};

initializeStore();

export const cleanupLogsStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};

export type { Log };
