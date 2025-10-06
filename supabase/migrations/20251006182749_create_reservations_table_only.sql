/*
  # Create reservations table

  1. New Table
    - `reservations`: Store client reservations for offers
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `merchant_id` (uuid, references merchants)
      - `offer_id` (uuid, references offers)
      - `status` (text, enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add basic policies
*/

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  offer_id uuid REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending','confirmed','expired','cancelled')) DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reservations_client_id ON public.reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_merchant_id ON public.reservations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_offer_id ON public.reservations(offer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
