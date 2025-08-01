-- Remove all webhook triggers and function

-- Drop the triggers
DROP TRIGGER IF EXISTS log_insert_trigger ON public.log;
DROP TRIGGER IF EXISTS log_update_trigger ON public.log;

-- Drop the webhook function
DROP FUNCTION IF EXISTS public.handle_log_changes(); 