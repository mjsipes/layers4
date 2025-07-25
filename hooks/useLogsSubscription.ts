import { useEffect } from "react";
import { useLogStore } from "@/stores/logs_store";
import { createClient } from "@/lib/supabase/client";
import { useGlobalStore } from "@/stores/global_store";

const supabase = createClient();

export function useLogsSubscription() {
  const setLogs = useLogStore((state) => state.setLogs);
  const setSelectedItem = useGlobalStore((state) => state.setSelectedItem);

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
        async (payload) => {
          console.log("useLogsSubscription: log table changed", payload);
          await fetchLogs();
          if (
            payload?.eventType === "INSERT" ||
            payload?.eventType === "UPDATE"
          ) {
            const newLogId = payload?.new?.id;
            if (newLogId) {
              setSelectedItem(newLogId, "selectlog");
            }
          }
        }
      )
      .subscribe();

    const logLayerChannel = supabase
      .channel("log-layer-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "log_layer" },
        async (payload) => {
          console.log("useLogsSubscription: log_layer table changed", payload);
          await fetchLogs();
          // if (
          //   payload?.eventType === "INSERT" ||
          //   payload?.eventType === "UPDATE"
          // ) {
          //   const newLogId = payload?.new?.log_id;
          //   if (newLogId) {
          //     setSelectedItem(newLogId, "selectlog");
          //   }
          // }
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