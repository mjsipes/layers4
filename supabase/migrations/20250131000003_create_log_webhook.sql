-- Create webhook to trigger weather-webhook edge function on log table changes

-- Create the webhook function using Supabase vault for service role key
CREATE OR REPLACE FUNCTION public.handle_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the weather-webhook edge function with service role key from vault
  PERFORM
    net.http_post(
      url := 'https://zoyvqdccoilrpiwpzzym.supabase.co/functions/v1/weather-webhook',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || vault.get('service_role_key') || '"}',
      body := json_build_object(
        'record', NEW,
        'old_record', OLD
      )::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for INSERT operations on log table
CREATE TRIGGER log_insert_trigger
  AFTER INSERT ON public.log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_log_changes();

-- Create trigger for UPDATE operations on log table
CREATE TRIGGER log_update_trigger
  AFTER UPDATE ON public.log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_log_changes();

-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions"; 