/*
  # Fix get_offers_near_client function - Remove non-existent address column
  
  1. Changes
    - Drop and recreate `get_offers_near_client` function
    - Remove merchant_address from return type (column doesn't exist in merchants table)
    - Keep all other fields: merchant_street, merchant_city, merchant_postal_code
    
  2. Return Columns
    - All existing columns except merchant_address
    - Use street, city, postal_code instead
    
  3. Notes
    - This fixes the "column m.address does not exist" error
    - Frontend can build full address from street, city, postal_code if needed
*/

DROP FUNCTION IF EXISTS get_offers_near_client(uuid, integer);

CREATE OR REPLACE FUNCTION get_offers_near_client(
  client_id uuid,
  radius_meters integer DEFAULT 10000
)
RETURNS TABLE(
  id uuid,
  merchant_id uuid,
  merchant_name text,
  title text,
  description text,
  image_url text,
  price_before numeric,
  price_after numeric,
  discount_percent integer,
  available_from timestamptz,
  available_until timestamptz,
  quantity integer,
  distance_m double precision,
  offer_lat double precision,
  offer_lng double precision,
  merchant_street text,
  merchant_city text,
  merchant_postal_code text,
  category text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.merchant_id,
    m.company_name as merchant_name,
    o.title,
    o.description,
    o.image_url,
    o.price_before,
    o.price_after,
    o.discount_percent,
    o.available_from,
    o.available_until,
    o.quantity,
    ST_Distance(o.location, c.location)::double precision as distance_m,
    ST_Y(o.location::geometry)::double precision as offer_lat,
    ST_X(o.location::geometry)::double precision as offer_lng,
    m.street as merchant_street,
    m.city as merchant_city,
    m.postal_code as merchant_postal_code,
    o.category,
    o.created_at
  FROM offers o
  INNER JOIN clients c ON c.id = get_offers_near_client.client_id
  INNER JOIN merchants m ON m.id = o.merchant_id
  WHERE 
    o.is_active = true
    AND now() BETWEEN o.available_from AND o.available_until
    AND o.location IS NOT NULL
    AND c.location IS NOT NULL
    AND ST_DWithin(o.location, c.location, get_offers_near_client.radius_meters)
  ORDER BY distance_m ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_offers_near_client(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_offers_near_client(uuid, integer) TO anon;
