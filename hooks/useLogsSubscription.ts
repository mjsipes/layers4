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
        log_layer_recs:log_layer_recs(*, layer:layer_id(*)),
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
        recommendedLayers: log.log_layer_recs?.map((llr: any) => llr.layer) ?? [],
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
          else if (payload?.eventType === "DELETE") {
            console.log("useLogsSubscription: log table deleted");
            const logs = useLogStore.getState().logs;
            if (logs.length > 0) {
              setSelectedItem(logs[0].id, "selectlog");
            } else {
              setSelectedItem(null, "selectlog");
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

    const logLayerRecsChannel = supabase
      .channel("log-layer-recs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "log_layer_recs" },
        async (payload) => {
          console.log("useLogsSubscription: log_layer_recs table changed", payload);
          await fetchLogs();
        }
      )
      .subscribe();

    return () => {
      console.log("useLogsSubscription: Removing log, log_layer, and log_layer_recs channels");
      supabase.removeChannel(logChannel);
      supabase.removeChannel(logLayerChannel);
      supabase.removeChannel(logLayerRecsChannel);
    };
  }, []);
} 