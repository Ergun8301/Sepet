/*
  # Enable Realtime on tables

  1. Realtime
    - Enable Realtime on offers table
    - Enable Realtime on reservations table
    - Enable Realtime on notifications table
    
  2. Permissions
    - Grant necessary permissions for Realtime subscriptions
*/

-- Enable Realtime on offers
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

-- Enable Realtime on reservations
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;

-- Enable Realtime on notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
