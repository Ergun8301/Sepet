/*
  # Create merchants table for business profiles

  1. New Tables
    - `merchants`
      - `id` (uuid, primary key, references auth.users)
      - `company_name` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `email` (text, unique)
      - `street` (text)
      - `city` (text)
      - `postal_code` (text)
      - `country` (text, default 'FR')
      - `full_address` (text, computed)
      - `avg_rating` (decimal, default 0)
      - `points` (integer, default 0)
      - `logo_url` (text)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `merchants` table
    - Add policy for merchants to read/write their own data
    - Add policy for public to read approved merchants
*/

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
  full_address text GENERATED ALWAYS AS (
    CASE 
      WHEN street IS NOT NULL AND city IS NOT NULL THEN 
        CONCAT(street, ', ', city, 
               CASE WHEN postal_code IS NOT NULL THEN CONCAT(', ', postal_code) ELSE '' END,
               CASE WHEN country IS NOT NULL THEN CONCAT(', ', country) ELSE '' END)
      WHEN city IS NOT NULL THEN 
        CONCAT(city,
               CASE WHEN postal_code IS NOT NULL THEN CONCAT(', ', postal_code) ELSE '' END,
               CASE WHEN country IS NOT NULL THEN CONCAT(', ', country) ELSE '' END)
      ELSE NULL
    END
  ) STORED,
  avg_rating decimal(3,2) DEFAULT 0,
  points integer DEFAULT 0,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Public can read merchant data (for displaying in app)
CREATE POLICY "Public can read merchant data"
  ON merchants
  FOR SELECT
  TO anon, authenticated
  USING (true);