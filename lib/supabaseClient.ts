import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client Supabase unique
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Vérification de la disponibilité du client
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

// Mock functions pour quand Supabase n'est pas disponible
const mockAuth = {
  getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  signInWithOAuth: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  signOut: () => Promise.resolve({ error: null }),
  resetPasswordForEmail: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
};

const mockFrom = () => ({
  select: () => ({
    eq: () => ({
      single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    })
  }),
  insert: () => ({
    select: () => ({
      single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    })
  }),
  update: () => ({
    eq: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
      })
    })
  })
});

// Export du client avec fallback
export const getSupabaseClient = () => {
  if (supabase) {
    return supabase;
  }
  
  // Mock client si Supabase n'est pas disponible
  return {
    auth: mockAuth,
    from: mockFrom
  };
};