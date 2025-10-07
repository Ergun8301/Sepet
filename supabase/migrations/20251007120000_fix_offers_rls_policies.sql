/*
  # Fix Offers RLS Policies

  1. Changes
    - Drop old offers policies that use obsolete merchant structure
    - Create new policies aligned with current merchant table structure
    - Merchants can INSERT, SELECT, UPDATE, DELETE their own offers
    - Public can SELECT active offers

  2. Security
    - Merchants identified by auth.uid() = merchant_id (direct reference)
    - No more intermediate table lookup needed
    - Proper separation: merchants manage their offers, public views active offers
*/

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Active offers are viewable by everyone" ON public.offers;
DROP POLICY IF EXISTS "Merchants can manage their offers" ON public.offers;

-- Public can view all active offers
CREATE POLICY "Public can view active offers"
  ON public.offers
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Merchants can view their own offers (active or not)
CREATE POLICY "Merchants can view own offers"
  ON public.offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

-- Merchants can insert their own offers
CREATE POLICY "Merchants can insert own offers"
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

-- Merchants can update their own offers
CREATE POLICY "Merchants can update own offers"
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

-- Merchants can delete their own offers
CREATE POLICY "Merchants can delete own offers"
  ON public.offers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = merchant_id);
