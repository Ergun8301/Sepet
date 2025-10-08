/*
  # Fix Geocode Queue Worker Cron with Anon Key

  1. Overview
    - Updates trigger function to use anon key instead of service role key
    - Hardcodes the Supabase project URL (xrqmqfiqtyskbkmxydnc.supabase.co)
    - Uses anon key which is safe to store in the database

  2. Security Note
    - Anon key is designed to be public
    - Edge Function has verify_jwt=false, so anon key works fine
    - This is a legitimate use case for calling public Edge Functions

  3. Implementation
    - Replaces the problematic current_setting calls
    - Uses known project URL and anon key
*/

CREATE OR REPLACE FUNCTION public.trigger_geocode_queue_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response_id bigint;
  v_supabase_url text := 'https://xrqmqfiqtyskbkmxydnc.supabase.co';
  v_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycW1xZmlxdHlza2JrbXh5ZG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODEyNjQsImV4cCI6MjA3NTA1NzI2NH0.9B5vRp2NOt-uWYoFRcVBQOtUMx4kfqK-9aPyWJnc4VM';
BEGIN
  -- Make async HTTP request to Edge Function
  SELECT net.http_post(
    url := v_supabase_url || '/functions/v1/geocode-queue-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := '{}'::jsonb
  ) INTO v_response_id;
  
  RAISE NOTICE 'Triggered geocode queue worker, request ID: %', v_response_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to trigger geocode queue worker: %', SQLERRM;
END;
$$;
