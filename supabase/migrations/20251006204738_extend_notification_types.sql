/*
  # Extend notification types

  1. Schema Changes
    - Update notification type constraint to include new types
    - Add trigger for stock_empty notifications
    
  2. New notification types
    - 'review': When a client posts a review
    - 'stock_empty': When an offer runs out of stock
    - 'daily_summary': Daily summary notifications
*/

-- Drop existing constraint and recreate with new types
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN ('reservation', 'offer', 'system', 'review', 'stock_empty', 'daily_summary'));

-- Function to notify when offer stock reaches zero
CREATE OR REPLACE FUNCTION notify_stock_empty()
RETURNS TRIGGER AS $$
DECLARE
  offer_title text;
  merchant_id uuid;
BEGIN
  -- Only trigger when quantity goes from > 0 to 0
  IF OLD.quantity > 0 AND NEW.quantity = 0 AND NEW.is_active = true THEN
    SELECT title, merchant_id INTO offer_title, merchant_id
    FROM public.offers
    WHERE id = NEW.id;

    INSERT INTO public.notifications (user_id, user_type, title, message, type, related_id)
    VALUES (
      merchant_id,
      'merchant',
      'Offer Sold Out',
      'Your offer "' || COALESCE(offer_title, 'Unknown Offer') || '" is now out of stock!',
      'stock_empty',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for stock empty notifications
DROP TRIGGER IF EXISTS trigger_stock_empty_notification ON public.offers;
CREATE TRIGGER trigger_stock_empty_notification
  AFTER UPDATE OF quantity ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION notify_stock_empty();

GRANT EXECUTE ON FUNCTION notify_stock_empty() TO authenticated;
