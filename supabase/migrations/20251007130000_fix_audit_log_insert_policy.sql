/*
  # Fix audit_log INSERT policy for triggers

  1. Changes
    - Add INSERT policy for audit_log to allow SECURITY DEFINER triggers to write
    - System can insert audit logs (triggers with SECURITY DEFINER)
    - Maintains read restriction (users can only SELECT their own logs)

  2. Security
    - INSERT allowed for authenticated users (triggers run as SECURITY DEFINER)
    - SELECT restricted to user's own logs (user_id = auth.uid())
    - No UPDATE or DELETE allowed (audit logs are immutable)
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Allow INSERT for audit_log (needed for triggers with SECURITY DEFINER)
CREATE POLICY "System can insert audit logs"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: SELECT policy already exists ("Users can view own audit logs")
-- Note: No UPDATE or DELETE policies (audit logs should be immutable)
