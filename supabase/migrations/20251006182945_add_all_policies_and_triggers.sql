/*
  # Add RLS policies and triggers

  1. RLS Policies
    - Reservations: insert, select, update
    - Notifications: select, update, insert
    
  2. Triggers
    - Update updated_at on reservations
    - Create notifications on reservation changes
    - Auto-expire old reservations
*/

-- RLS Policies for reservations
DROP POLICY IF EXISTS "Clients can create reservations" ON public.reservations;
CREATE POLICY "Clients can create reservations"
  ON public.reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients view own reservations" ON public.reservations;
CREATE POLICY "Clients view own reservations"
  ON public.reservations
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Merchants view their reservations" ON public.reservations;
CREATE POLICY "Merchants view their reservations"
  ON public.reservations
  FOR SELECT
  TO authenticated
  USING (merchant_id = auth.uid());

DROP POLICY IF EXISTS "Merchants update reservation status" ON public.reservations;
CREATE POLICY "Merchants update reservation status"
  ON public.reservations
  FOR UPDATE
  TO authenticated
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

DROP POLICY IF EXISTS "Clients cancel own reservations" ON public.reservations;
CREATE POLICY "Clients cancel own reservations"
  ON public.reservations
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() AND status = 'pending')
  WITH CHECK (status IN ('cancelled', 'pending'));

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
CREATE POLICY "System insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger function: update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger function: notify on reservation changes
CREATE OR REPLACE FUNCTION notify_reservation_change()
RETURNS TRIGGER AS $$
DECLARE
  offer_title text;
  merchant_name text;
BEGIN
  SELECT title INTO offer_title FROM public.offers WHERE id = NEW.offer_id;
  SELECT company_name INTO merchant_name FROM public.merchants WHERE id = NEW.merchant_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
    VALUES (
      NEW.merchant_id, 'merchant', 'New Reservation',
      'You have a new reservation for "' || COALESCE(offer_title, 'Unknown Offer') || '"',
      'reservation', NEW.id
    );
    
    INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
    VALUES (
      NEW.client_id, 'client', 'Reservation Created',
      'Your reservation for "' || COALESCE(offer_title, 'Unknown Offer') || '" has been created',
      'reservation', NEW.id
    );
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
    VALUES (
      NEW.client_id, 'client', 'Reservation ' || initcap(NEW.status),
      'Your reservation at "' || COALESCE(merchant_name, 'Unknown Merchant') || '" is now ' || NEW.status,
      'reservation', NEW.id
    );
    
    IF NEW.status = 'cancelled' THEN
      INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
      VALUES (
        NEW.merchant_id, 'merchant', 'Reservation Cancelled',
        'A reservation for "' || COALESCE(offer_title, 'Unknown Offer') || '" was cancelled',
        'reservation', NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_reservation_notifications ON public.reservations;
CREATE TRIGGER trigger_reservation_notifications
  AFTER INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_reservation_change();

-- Function: auto-expire old reservations
CREATE OR REPLACE FUNCTION expire_old_reservations()
RETURNS void AS $$
BEGIN
  UPDATE public.reservations
  SET status = 'expired'
  WHERE status = 'pending'
    AND created_at + interval '2 hours' < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION expire_old_reservations() TO authenticated;
GRANT EXECUTE ON FUNCTION expire_old_reservations() TO service_role;

-- Schedule expiration (every 10 minutes)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-old-reservations') THEN
    PERFORM cron.unschedule('expire-old-reservations');
  END IF;
END $$;

SELECT cron.schedule('expire-old-reservations', '*/10 * * * *', 'SELECT expire_old_reservations();');
