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
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("useLogsSubscription/fetchLogs: ", error);
      setLogs([]);
      return [];
    }

    console.log("useLogsSubscription/fetchLogs: ", data);

    const logsWithRelations =
      data?.map((log: any) => ({
        ...log,
        layers: log.log_layer?.map((ll: any) => ll.layer) ?? [],
      })) ?? [];

    console.log("useLogsSubscription/fetchLogs: ", logsWithRelations);

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
          console.log("useLogsSubscription: log table changed");
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
          console.log("useLogsSubscription: log_layer table changed");
          await fetchLogs();
        }
      )
      .subscribe();

    return () => {
      console.log("useLogsSubscription: Removing log and log_layer channels");
      supabase.removeChannel(logChannel);
      supabase.removeChannel(logLayerChannel);
    };
  }, []);
} 