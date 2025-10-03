import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
  user: User | null;
  loading: boolean;
  userType: 'customer' | 'merchant' | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setUserType: (type: 'customer' | 'merchant' | null) => void;
  signOut: () => Promise<void>;
  checkUserType: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  userType: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setUserType: (userType) => set({ userType }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, userType: null });
  },
  checkUserType: async () => {
    const { user } = get();
    if (!user) {
      set({ userType: null });
      return;
    }

    try {
      // Check if user is a merchant
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('id', user.id)
        .single();

      if (merchant) {
        set({ userType: 'merchant' });
      } else {
        set({ userType: 'customer' });
      }
    } catch (error) {
      console.error('Error checking user type:', error);
      set({ userType: 'customer' }); // Default to customer
    }
  },
}));

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setUser(session?.user ?? null);
  useAuthStore.getState().setLoading(false);
  if (session?.user) {
    useAuthStore.getState().checkUserType();
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
  useAuthStore.getState().setLoading(false);
  if (session?.user) {
    useAuthStore.getState().checkUserType();
  } else {
    useAuthStore.getState().setUserType(null);
  }
});