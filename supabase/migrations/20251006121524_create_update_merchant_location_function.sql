/*
  # Create function to update merchant location with geocoded coordinates

  1. New Function
    - `update_merchant_location`: Updates a merchant's location field with PostGIS geometry
      - Parameters: merchant_id (uuid), longitude (float), latitude (float), status (text)
      - Sets location as a Point geometry with SRID 4326
      - Updates geocode_status and geocoded_at timestamp
  
  2. Purpose
    - Enables the geocoding script to properly update geography columns for merchants
    - Ensures proper PostGIS point creation with correct coordinate system
*/

CREATE OR REPLACE FUNCTION update_merchant_location(
  merchant_id uuid,
  longitude double precision,
  latitude double precision,
  status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE merchants
  SET 
    location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    geocode_status = status,
    geocoded_at = now()
  WHERE id = merchant_id;
END;
$$;
