/*
  # Create Cron Job for Geocode Queue Worker

  1. Overview
    - Creates a cron job that runs every minute to process the geocode queue
    - Calls the geocode-queue-worker Edge Function to process pending items
    - Ensures automatic geocoding of new merchants and clients

  2. Implementation
    - Uses pg_cron to schedule the job
    - Calls the Edge Function via HTTP request using pg_net
    - Runs every minute to ensure near-real-time geocoding

  3. Dependencies
    - Requires pg_cron extension (already enabled)
    - Requires pg_net extension for HTTP requests
    - Requires geocode-queue-worker Edge Function (deployed)
*/

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to trigger the queue worker
CREATE OR REPLACE FUNCTION public.trigger_geocode_queue_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_response_id bigint;
BEGIN
  -- Make async HTTP request to Edge Function
  -- Note: Supabase will automatically inject the correct URL and service key
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/geocode-queue-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) INTO v_response_id;
  
  RAISE NOTICE 'Triggered geocode queue worker, request ID: %', v_response_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to trigger geocode queue worker: %', SQLERRM;
END;
$function$;

-- Schedule the cron job to run every minute
SELECT cron.schedule(
  'geocode-queue-worker-every-minute',
  '* * * * *',
  'SELECT public.trigger_geocode_queue_worker()'
);
