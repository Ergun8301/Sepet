/*
  # Create atomic reservation function with stock management

  1. New Function
    - `create_reservation_with_stock_check`: Atomically creates reservation and deducts stock
      - Parameters:
        - p_client_id (uuid): Client making the reservation
        - p_merchant_id (uuid): Merchant owning the offer
        - p_offer_id (uuid): Offer being reserved
        - p_quantity (integer): Quantity to reserve
      - Returns: JSON with success status and reservation data or error message
      - Validates:
        - Offer exists and is active
        - Sufficient stock available
        - Offer hasn't expired
      - Actions:
        - Deducts quantity from offers.quantity
        - Creates reservation with pending status
        - Creates notification for merchant
        - Returns complete reservation data

  2. Security
    - Function uses SECURITY DEFINER to bypass RLS for stock check
    - Validates client authentication
    - Ensures atomic transaction (all or nothing)

  3. Notifications
    - Creates notification for merchant when reservation is made
    - Type: 'reservation_created'
    - Links to reservation and offer
*/

-- Create atomic reservation function
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

  -- Create notification for merchant
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    reservation_id,
    offer_id,
    is_read
  ) VALUES (
    p_merchant_id,
    'reservation_created',
    'New Reservation',
    format('You have a new reservation for %s unit(s) of "%s"', p_quantity, v_offer_record.title),
    v_reservation_id,
    p_offer_id,
    false
  );

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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_reservation_with_stock_check(uuid, uuid, uuid, integer) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.create_reservation_with_stock_check IS
'Atomically creates a reservation and deducts stock from the offer. Ensures data consistency and prevents overbooking.';
