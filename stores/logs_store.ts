// /stores/logs_store.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/supabase/database.types';

const supabase = createClient();

type Log = Tables<'log'>;

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
    // Fetch initial data
    const { data, error } = await supabase.from("log").select("*").order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching logs:", error);
      useLogStore.setState({ logs: [] });
      return;
    }
    
    useLogStore.setState({ logs: data || [] });
    
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
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          
          if (eventType === "INSERT") {
            useLogStore.setState((state) => ({ 
              logs: [newRow as Log, ...state.logs] 
            }));
          } else if (eventType === "UPDATE") {
            useLogStore.setState((state) => ({
              logs: state.logs.map((log) => 
                log.id === (newRow as Log).id ? newRow as Log : log
              )
            }));
          } else if (eventType === "DELETE") {
            useLogStore.setState((state) => ({
              logs: state.logs.filter((log) => log.id !== (oldRow as Log).id)
            }));
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
