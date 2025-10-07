/*
  # Add updated_at column to offers for proper sorting

  1. Changes
    - Add `updated_at` column to offers table
    - Default to created_at for existing records
    - Create trigger to automatically update updated_at on modifications
    - Update gets the current timestamp whenever the row is modified

  2. Purpose
    - When a merchant updates an offer (price, quantity, is_active), it should appear first in the list
    - Allows sorting by most recently modified offers
    - Better user experience - updated offers get visibility

  3. Trigger
    - Auto-updates updated_at column on UPDATE operations
    - Does not fire on INSERT (uses created_at initially)
*/

-- Add updated_at column to offers table
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Set updated_at to created_at for existing records
UPDATE public.offers
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after backfilling
ALTER TABLE public.offers
ALTER COLUMN updated_at SET NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on row modification
DROP TRIGGER IF EXISTS set_updated_at ON public.offers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_offers_updated_at ON public.offers(updated_at DESC);

-- Add comment
COMMENT ON COLUMN public.offers.updated_at IS
'Timestamp of last modification. Auto-updated on UPDATE. Used for sorting to show recently updated offers first.';
