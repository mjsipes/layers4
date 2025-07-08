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
};

// Global state to track subscription
let isSubscribed = false;
let channel: any = null;

export const useLogStore = create<LogState>((set) => ({
  logs: [],
}));

// Auto-initialize the store when first imported
const initializeStore = async () => {
  if (isSubscribed) return;
  
  try {
    // Fetch initial data with outfit and weather joins
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
      console.error("Error fetching logs:", error);
      useLogStore.setState({ logs: [] });
      return;
    }
    
    // Transform the data to include layers properly
    const logsWithRelations = data?.map(log => ({
      ...log,
      outfit: log.outfit ? {
        ...log.outfit,
        layers: log.outfit.outfit_layer?.map((ol: any) => ol.layer) || []
      } : undefined
    })) || [];
    
    useLogStore.setState({ logs: logsWithRelations });
    
    // Set up real-time subscription
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
          // Refetch all logs when there's any change to maintain consistency
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
          
          if (!error && data) {
            const logsWithRelations = data.map(log => ({
              ...log,
              outfit: log.outfit ? {
                ...log.outfit,
                layers: log.outfit.outfit_layer?.map((ol: any) => ol.layer) || []
              } : undefined
            }));
            useLogStore.setState({ logs: logsWithRelations });
          }
        }
      )
      .subscribe();
    
    isSubscribed = true;
    
  } catch (error) {
    console.error("Error initializing logs store:", error);
    useLogStore.setState({ logs: [] });
  }
};

// Initialize automatically
initializeStore();

// Cleanup function for when the app unmounts (optional)
export const cleanupLogsStore = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    isSubscribed = false;
  }
};

export type { Log };
