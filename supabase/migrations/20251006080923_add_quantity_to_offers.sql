-- Add quantity column to offers table
-- This migration adds a quantity field to track available stock for each offer

-- Add quantity column with default value 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE offers ADD COLUMN quantity int4 DEFAULT 0 NOT NULL;
  END IF;
END $$;
