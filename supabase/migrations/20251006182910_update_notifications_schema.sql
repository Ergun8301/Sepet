/*
  # Update notifications table schema

  1. Modifications
    - Add missing columns: user_id, user_type, title, message, related_id
    - Keep existing columns for compatibility
    
  2. Security
    - Enable RLS if not already enabled
*/

-- Add missing columns
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS user_id uuid,
ADD COLUMN IF NOT EXISTS user_type text CHECK (user_type IN ('client','merchant')),
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS message text,
ADD COLUMN IF NOT EXISTS related_id uuid;

-- Set user_id from client_id or merchant_id for existing rows
UPDATE public.notifications
SET user_id = COALESCE(client_id, merchant_id)
WHERE user_id IS NULL;

-- Set user_type based on which ID is present
UPDATE public.notifications
SET user_type = CASE 
  WHEN client_id IS NOT NULL THEN 'client'
  WHEN merchant_id IS NOT NULL THEN 'merchant'
  ELSE 'client'
END
WHERE user_type IS NULL;

-- Set default values for title and message if NULL
UPDATE public.notifications
SET title = 'Notification', message = 'You have a new notification'
WHERE title IS NULL OR message IS NULL;

-- Now make required columns NOT NULL
ALTER TABLE public.notifications
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN user_type SET NOT NULL,
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN message SET NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON public.notifications(user_type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
