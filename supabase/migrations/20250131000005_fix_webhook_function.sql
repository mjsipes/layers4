-- Fix the webhook function to use a simpler approach

-- Drop the existing triggers first
DROP TRIGGER IF EXISTS log_insert_trigger ON public.log;
DROP TRIGGER IF EXISTS log_update_trigger ON public.log;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_log_changes();

-- Create a simpler webhook function that doesn't rely on vault
CREATE OR REPLACE FUNCTION public.handle_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- For now, just log the change without calling the edge function
  -- This will allow logs to be updated without the webhook failing
  RAISE LOG 'Log change detected: % -> %', OLD, NEW;
  
  -- TODO: Re-enable the edge function call once we figure out the authentication
  -- PERFORM
  --   net.http_post(
  --     url := 'https://zoyvqdccoilrpiwpzzym.supabase.co/functions/v1/weather-webhook',
  --     headers := '{"Content-Type": "application/json"}',
  --     body := json_build_object('record', NEW, 'old_record', OLD)::text
  --   );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER log_insert_trigger
  AFTER INSERT ON public.log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_log_changes();

CREATE TRIGGER log_update_trigger
  AFTER UPDATE ON public.log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_log_changes(); 