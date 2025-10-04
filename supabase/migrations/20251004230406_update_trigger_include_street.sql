/*
  # Update auto-create profiles trigger to include street address

  1. Changes
    - Add street field to both client and merchant profile creation
    - Retrieve street from user metadata during signup
    - Maintains all existing functionality

  2. Security
    - No changes to RLS policies
    - Maintains SECURITY DEFINER function
*/

-- Update function to include street field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_type text;
BEGIN
  -- Get user type from metadata
  user_type := NEW.raw_user_meta_data->>'user_type';

  -- Create client profile
  IF user_type = 'client' THEN
    INSERT INTO public.clients (
      id,
      email,
      first_name,
      last_name,
      phone,
      street,
      city,
      postal_code,
      country
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'street',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'postal_code',
      COALESCE(NEW.raw_user_meta_data->>'country', 'FR')
    )
    ON CONFLICT (id) DO NOTHING;
    
  -- Create merchant profile
  ELSIF user_type = 'merchant' THEN
    INSERT INTO public.merchants (
      id,
      email,
      company_name,
      first_name,
      last_name,
      phone,
      street,
      city,
      postal_code,
      country
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'street',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'postal_code',
      COALESCE(NEW.raw_user_meta_data->>'country', 'FR')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
