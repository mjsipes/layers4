import { useEffect } from "react";
import { useLogStore } from "@/stores/logs_store";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useLogsSubscription() {
  const setLogs = useLogStore((state) => state.setLogs);

  // Fetch all logs and update the store
  const fetchLogs = async () => {
    console.log("🔵 [LOGS] Fetching logs (initial)");
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
      setLogs([]);
      return [];
    }

    console.log("🟢 [LOGS] Raw data:", data);

    const logsWithRelations =
      data?.map((log: any) => ({
        ...log,
        outfit: log.outfit
          ? {
              ...log.outfit,
              layers: log.outfit.outfit_layer?.map((ol: any) => ol.layer) ?? [],
            }
          : undefined,
      })) ?? [];

    setLogs(logsWithRelations);
    return logsWithRelations;
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel("logs-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "log" },
        async () => {
          console.log("🔵 [LOGS] log table subscription triggered");
          await fetchLogs();
        }
      )
      .subscribe();

    return () => {
      console.log("🟡 [LOGS] Removing logs channel");
      supabase.removeChannel(channel);
    };
  }, []);
} 