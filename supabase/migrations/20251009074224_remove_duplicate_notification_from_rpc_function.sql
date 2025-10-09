/*
  # Remove duplicate notification from RPC function

  1. Problem
    - create_reservation_with_stock_check function creates notification for merchant
    - trigger_reservation_notifications ALSO creates notifications for merchant AND client
    - Result: Duplicate notification for merchant

  2. Solution
    - Remove notification INSERT from RPC function
    - Let the trigger handle ALL notification creation
    - Trigger is more complete (handles INSERT, UPDATE, status changes)

  3. Benefits
    - No duplicate notifications
    - Consistent notification logic in one place (trigger)
    - Client gets notification (trigger creates it)
    - Merchant gets notification (trigger creates it)
*/

-- Recreate the function WITHOUT notification creation
CREATE OR REPLACE FUNCTION public.create_reservation_with_stock_check(
  p_client_id uuid,
  p_merchant_id uuid,
  p_offer_id uuid,
  p_quantity integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_record RECORD;
  v_reservation_id uuid;
  v_result jsonb;
BEGIN
  -- Validate quantity
  IF p_quantity < 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Quantity must be at least 1'
    );
  END IF;

  -- Lock the offer row for update to prevent race conditions
  SELECT
    id,
    merchant_id,
    quantity,
    is_active,
    available_until,
    title,
    price_after
  INTO v_offer_record
  FROM public.offers
  WHERE id = p_offer_id
  FOR UPDATE;

  -- Check if offer exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Offer not found'
    );
  END IF;

  -- Check if offer is active
  IF NOT v_offer_record.is_active THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This offer is no longer active'
    );
  END IF;

  -- Check if offer has expired
  IF v_offer_record.available_until < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This offer has expired'
    );
  END IF;

  -- Check if sufficient stock available
  IF v_offer_record.quantity < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Only %s unit(s) available', v_offer_record.quantity)
    );
  END IF;

  -- Deduct stock from offer
  UPDATE public.offers
  SET quantity = quantity - p_quantity
  WHERE id = p_offer_id;

  -- Create reservation
  -- Note: trigger_reservation_notifications will automatically create notifications
  -- for both merchant and client after this INSERT
  INSERT INTO public.reservations (
    client_id,
    merchant_id,
    offer_id,
    quantity,
    status
  ) VALUES (
    p_client_id,
    p_merchant_id,
    p_offer_id,
    p_quantity,
    'pending'
  )
  RETURNING id INTO v_reservation_id;

  -- ✅ NO notification INSERT here - trigger handles it
  -- The trigger_reservation_notifications will fire automatically and create:
  -- 1. Notification for merchant: "New Reservation"
  -- 2. Notification for client: "Reservation Created"

  -- Return success with reservation data
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'id', v_reservation_id,
      'client_id', p_client_id,
      'merchant_id', p_merchant_id,
      'offer_id', p_offer_id,
      'quantity', p_quantity,
      'status', 'pending',
      'remaining_stock', v_offer_record.quantity - p_quantity
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Database error: %s', SQLERRM)
    );
END;
$$;

-- Ensure permissions are still granted
GRANT EXECUTE ON FUNCTION public.create_reservation_with_stock_check(uuid, uuid, uuid, integer) TO authenticated;

-- Update comment
COMMENT ON FUNCTION public.create_reservation_with_stock_check IS
'Atomically creates a reservation and deducts stock from the offer. Notifications are created automatically by trigger_reservation_notifications. Ensures data consistency and prevents overbooking.';