/*
  # Fix User Type System - Separate Client and Merchant Flows

  1. Problem Analysis
    - No distinction between client and merchant users in auth.users
    - Conflicting table schemas between migrations
    - RLS policies preventing proper registration
    - Missing user_type tracking

  2. Solution
    - Use auth.users.raw_app_meta_data to store user_type
    - Keep separate clients and merchants tables
    - Adjust RLS policies to allow registration
    - Add helper function to identify user type

  3. Changes
    - Drop old conflicting tables if they exist
    - Create clean clients table
    - Create clean merchants table  
    - Add permissive RLS policies for registration
    - Add function to get user type from metadata

  4. Important Notes
    - Clients and merchants will have different registration flows
    - User type is set in app_metadata during signup
    - Both tables reference auth.users(id) directly
*/

-- Drop existing tables to clean up conflicts
DROP TABLE IF EXISTS public.merchants CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  email text UNIQUE,
  street text,
  city text,
  postal_code text,
  country text DEFAULT 'FR',
  profile_photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create merchants table
CREATE TABLE IF NOT EXISTS public.merchants (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  email text UNIQUE,
  street text,
  city text,
  postal_code text,
  country text DEFAULT 'FR',
  logo_url text,
  points integer DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Clients can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can insert own data"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Clients can update own data"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Merchants policies
CREATE POLICY "Merchants can read own data"
  ON merchants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Merchants can insert own data"
  ON merchants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Merchants can update own data"
  ON merchants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public read access for app functionality
CREATE POLICY "Public can read merchant data"
  ON merchants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read client data"
  ON clients
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Helper function to get user type from metadata
CREATE OR REPLACE FUNCTION public.get_user_type()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'user_type'),
    'unknown'
  );
END;
$$;
