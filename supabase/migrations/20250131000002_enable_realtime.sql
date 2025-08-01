-- Enable realtime on all tables for live updates

-- Enable realtime on profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime on layer table
ALTER PUBLICATION supabase_realtime ADD TABLE public.layer;

-- Enable realtime on log table
ALTER PUBLICATION supabase_realtime ADD TABLE public.log;

-- Enable realtime on log_layer junction table
ALTER PUBLICATION supabase_realtime ADD TABLE public.log_layer;

-- Enable realtime on recommendations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.recommendations;

-- Enable realtime on weather table
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather; 