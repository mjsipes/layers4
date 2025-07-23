import { useEffect } from "react";
import { useLogStore } from "@/stores/logs_store";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useLogsSubscription() {
  const setLogs = useLogStore((state) => state.setLogs);

  // Fetch all logs and update the store
  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("log")
      .select(`
        *,
        log_layer:log_layer(*, layer:layer_id(*)),
        weather:weather_id (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[LOGS] Fetch error:", error);
      setLogs([]);
      return [];
    }

    const logsWithRelations =
      data?.map((log: any) => ({
        ...log,
        layers: log.log_layer?.map((ll: any) => ll.layer) ?? [],
      })) ?? [];

    setLogs(logsWithRelations);
    return logsWithRelations;
  };

  useEffect(() => {
    fetchLogs();

    const logChannel = supabase
      .channel("log-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "log" },
        async () => {
          console.log("[LOGS] log table changed");
          await fetchLogs();
        }
      )
      .subscribe();

    const logLayerChannel = supabase
      .channel("log-layer-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "log_layer" },
        async () => {
          console.log("[LOGS] log_layer table changed");
          await fetchLogs();
        }
      )
      .subscribe();

    return () => {
      console.log("[LOGS] Removing log and log_layer channels");
      supabase.removeChannel(logChannel);
      supabase.removeChannel(logLayerChannel);
    };
  }, []);
} 