/*
  # Add quantity to reservations and create stock management

  1. Schema Changes
    - Add quantity column to reservations table (default 1)
    
  2. Functions
    - `decrease_offer_quantity`: Decreases offer quantity and validates stock
    - Updates merchant notification to include quantity
    
  3. Triggers
    - Call decrease_offer_quantity after reservation insert
    - Update notification trigger to include quantity info
*/

-- Add quantity column to reservations
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1 NOT NULL;

-- Function to decrease offer quantity atomically
CREATE OR REPLACE FUNCTION decrease_offer_quantity()
RETURNS TRIGGER AS $$
DECLARE
  current_quantity integer;
BEGIN
  -- Lock the offer row and get current quantity
  SELECT quantity INTO current_quantity
  FROM public.offers
  WHERE id = NEW.offer_id
  FOR UPDATE;

  -- Check if enough quantity available
  IF current_quantity < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient quantity available. Requested: %, Available: %', NEW.quantity, current_quantity;
  END IF;

  -- Decrease the quantity
  UPDATE public.offers
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.offer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to decrease quantity after reservation insert
DROP TRIGGER IF EXISTS trigger_decrease_offer_quantity ON public.reservations;
CREATE TRIGGER trigger_decrease_offer_quantity
  AFTER INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION decrease_offer_quantity();

-- Update notification function to include quantity
CREATE OR REPLACE FUNCTION notify_reservation_change()
RETURNS TRIGGER AS $$
DECLARE
  offer_title text;
  merchant_name text;
  quantity_text text;
BEGIN
  SELECT title INTO offer_title FROM public.offers WHERE id = NEW.offer_id;
  SELECT company_name INTO merchant_name FROM public.merchants WHERE id = NEW.merchant_id;
  
  quantity_text := CASE 
    WHEN NEW.quantity > 1 THEN NEW.quantity || ' units'
    ELSE '1 unit'
  END;

  IF TG_OP = 'INSERT' THEN
    -- Notify merchant
    INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
    VALUES (
      NEW.merchant_id, 'merchant', 'New Reservation',
      'A client reserved ' || quantity_text || ' of "' || COALESCE(offer_title, 'Unknown Offer') || '"',
      'reservation', NEW.id
    );
    
    -- Notify client
    INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
    VALUES (
      NEW.client_id, 'client', 'Reservation Created',
      'Your reservation for ' || quantity_text || ' of "' || COALESCE(offer_title, 'Unknown Offer') || '" has been created',
      'reservation', NEW.id
    );
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify client of status change
    INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
    VALUES (
      NEW.client_id, 'client', 'Reservation ' || initcap(NEW.status),
      'Your reservation (' || quantity_text || ') at "' || COALESCE(merchant_name, 'Unknown Merchant') || '" is now ' || NEW.status,
      'reservation', NEW.id
    );
    
    -- If cancelled or expired, restore the quantity
    IF NEW.status IN ('cancelled', 'expired') AND OLD.status = 'pending' THEN
      UPDATE public.offers
      SET quantity = quantity + NEW.quantity
      WHERE id = NEW.offer_id;
      
      -- Notify merchant of cancellation
      INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
      VALUES (
        NEW.merchant_id, 'merchant', 'Reservation ' || initcap(NEW.status),
        'A reservation (' || quantity_text || ') for "' || COALESCE(offer_title, 'Unknown Offer') || '" was ' || NEW.status,
        'reservation', NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate notification trigger
DROP TRIGGER IF EXISTS trigger_reservation_notifications ON public.reservations;
CREATE TRIGGER trigger_reservation_notifications
  AFTER INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_reservation_change();

-- Grant permissions
GRANT EXECUTE ON FUNCTION decrease_offer_quantity() TO authenticated;
