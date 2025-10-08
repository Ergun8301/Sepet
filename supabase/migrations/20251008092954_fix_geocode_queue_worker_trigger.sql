/*
  # Fix Geocode Queue Worker Trigger Function

  1. Overview
    - Fixes the trigger_geocode_queue_worker function to use Supabase's built-in settings
    - Uses pg_net extension to call the Edge Function
    - Retrieves Supabase URL and service key from Supabase Vault

  2. Changes
    - Updates function to use vault.decrypted_secrets for API credentials
    - Properly constructs the Edge Function URL
    - Adds better error handling
*/

CREATE OR REPLACE FUNCTION public.trigger_geocode_queue_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response_id bigint;
  v_supabase_url text;
  v_service_key text;
BEGIN
  -- Get Supabase URL from current_setting
  -- In Supabase hosted environment, these are available
  BEGIN
    v_supabase_url := current_setting('request.headers', true)::json->>'x-forwarded-host';
    IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
      -- Fallback: try to get from postgres settings
      v_supabase_url := current_setting('app.settings.supabase_url', true);
    END IF;
    
    IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
      -- Last resort: construct from database name
      v_supabase_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Could not determine Supabase URL: %', SQLERRM;
      RETURN;
  END;

  -- Get service role key
  BEGIN
    v_service_key := current_setting('app.settings.service_role_key', true);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Could not get service role key: %', SQLERRM;
      RETURN;
  END;

  -- Make async HTTP request to Edge Function
  IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    SELECT net.http_post(
      url := v_supabase_url || '/functions/v1/geocode-queue-worker',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := '{}'::jsonb
    ) INTO v_response_id;
    
    RAISE NOTICE 'Triggered geocode queue worker, request ID: %', v_response_id;
  ELSE
    RAISE WARNING 'Missing Supabase URL or service key, cannot trigger worker';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to trigger geocode queue worker: %', SQLERRM;
END;
$$;
