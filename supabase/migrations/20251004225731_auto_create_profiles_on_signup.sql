/*
  # Auto-create user profiles on signup

  1. Problem
    - Users are created in auth.users but profiles are not automatically created
    - Frontend code may fail to create the profile
    - This causes users to appear in Authentication but not in table editor

  2. Solution
    - Create a database trigger that automatically creates profiles
    - Trigger fires when a new user is created in auth.users
    - Reads user_type from metadata and creates appropriate profile
    - Populates profile with data from user_metadata

  3. Benefits
    - 100% reliable - happens at database level
    - No frontend code can fail
    - Automatic and instant
    - Works even if frontend has bugs
*/

-- Function to auto-create client or merchant profile
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
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'postal_code',
      COALESCE(NEW.raw_user_meta_data->>'country', 'FR')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.clients TO supabase_auth_admin;
GRANT ALL ON public.merchants TO supabase_auth_admin;
