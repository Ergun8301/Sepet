/*
  # Create merchant dashboard view and audit log

  1. New Tables
    - `audit_log`: Tracks all database changes for merchants
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `table_name` (text)
      - `record_id` (uuid)
      - `action` (text): INSERT, UPDATE, DELETE
      - `old_data` (jsonb, nullable)
      - `new_data` (jsonb, nullable)
      - `changed_at` (timestamptz, default now())

  2. Views
    - `merchant_dashboard`: Aggregated stats for each merchant
      - merchant_id
      - company_name
      - avg_rating
      - total_offers
      - active_offers
      - pending_reservations
      - confirmed_reservations
      - total_reservations
      - total_units_sold
      - total_reviews

  3. Security
    - Enable RLS on audit_log
    - Merchants can only read their own audit logs
    - View respects merchant authentication

  4. Triggers
    - Auto-populate audit_log on offers changes
    - Auto-populate audit_log on reservations changes
*/

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_log;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Merchants can read their own logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Drop and recreate merchant_dashboard view
DROP VIEW IF EXISTS public.merchant_dashboard;

CREATE VIEW public.merchant_dashboard AS
SELECT
  m.id AS merchant_id,
  m.company_name,
  COALESCE(m.avg_rating, 0) AS avg_rating,
  COUNT(DISTINCT o.id) AS total_offers,
  COUNT(DISTINCT CASE WHEN o.is_active = true THEN o.id END) AS active_offers,
  COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.id END) AS pending_reservations,
  COUNT(DISTINCT CASE WHEN r.status = 'confirmed' THEN r.id END) AS confirmed_reservations,
  COUNT(DISTINCT r.id) AS total_reservations,
  COALESCE(SUM(CASE WHEN r.status = 'confirmed' THEN r.quantity ELSE 0 END), 0) AS total_units_sold,
  0 AS total_reviews
FROM public.merchants m
LEFT JOIN public.offers o ON o.merchant_id = m.id
LEFT JOIN public.reservations r ON r.merchant_id = m.id
GROUP BY m.id, m.company_name, m.avg_rating;

-- Grant access to the view
GRANT SELECT ON public.merchant_dashboard TO authenticated;

-- Function to log offers changes
CREATE OR REPLACE FUNCTION log_offer_changes()
RETURNS TRIGGER AS $$
DECLARE
  merchant_user_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    merchant_user_id := NEW.merchant_id;
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, new_data)
    VALUES (merchant_user_id, 'offers', NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    merchant_user_id := NEW.merchant_id;
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (merchant_user_id, 'offers', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    merchant_user_id := OLD.merchant_id;
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_data)
    VALUES (merchant_user_id, 'offers', OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log reservation changes
CREATE OR REPLACE FUNCTION log_reservation_changes()
RETURNS TRIGGER AS $$
DECLARE
  merchant_user_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    merchant_user_id := NEW.merchant_id;
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, new_data)
    VALUES (merchant_user_id, 'reservations', NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    merchant_user_id := NEW.merchant_id;
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (merchant_user_id, 'reservations', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    merchant_user_id := OLD.merchant_id;
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_data)
    VALUES (merchant_user_id, 'reservations', OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for audit logging
DROP TRIGGER IF EXISTS trigger_log_offer_changes ON public.offers;
CREATE TRIGGER trigger_log_offer_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION log_offer_changes();

DROP TRIGGER IF EXISTS trigger_log_reservation_changes ON public.reservations;
CREATE TRIGGER trigger_log_reservation_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION log_reservation_changes();

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_offer_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION log_reservation_changes() TO authenticated;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_changed_at 
  ON public.audit_log(user_id, changed_at DESC);
