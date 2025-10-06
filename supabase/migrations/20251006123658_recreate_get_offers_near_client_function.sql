/*
  # Recreate function to retrieve nearby offers for a client

  1. Drop existing function
    - Remove old version with incompatible return type
    
  2. New Function
    - `get_offers_near_client`: Returns active offers near a client's location
      - Parameters:
        - client_id (uuid): The client's ID
        - radius_meters (integer): Search radius in meters (default 10000 = 10km)
      - Returns: Table with offer details and distance
      
  3. Features
    - Uses PostGIS ST_DWithin for efficient spatial search
    - Calculates distance in meters using ST_Distance
    - Filters only active offers within time range
    - Orders by distance (closest first)
    - Returns merchant information for each offer
    
  4. Security
    - SECURITY DEFINER to access all tables
    - Public access allowed (read-only operation)
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
  distance_m double precision
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
    ST_Distance(o.location, c.location)::double precision as distance_m
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
