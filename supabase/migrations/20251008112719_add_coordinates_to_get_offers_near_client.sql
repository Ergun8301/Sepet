/*
  # Add latitude and longitude to get_offers_near_client function
  
  1. Changes
    - Drop and recreate `get_offers_near_client` function
    - Add `offer_lat` and `offer_lng` columns to return type
    - Extract latitude and longitude from PostGIS POINT geometry
    
  2. Return Columns
    - All existing columns (id, merchant_id, merchant_name, title, description, image_url, price_before, price_after, discount_percent, available_from, available_until, quantity, distance_m)
    - NEW: offer_lat (double precision) - Latitude of the offer location
    - NEW: offer_lng (double precision) - Longitude of the offer location
    
  3. Notes
    - Uses ST_Y() to extract latitude from geography
    - Uses ST_X() to extract longitude from geography
    - Maintains all existing functionality and security settings
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
  offer_lng double precision
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
    ST_X(o.location::geometry)::double precision as offer_lng
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
