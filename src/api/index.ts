import { supabase } from '../lib/supabaseClient';

// Location functions
export const setClientLocation = async (lat: number, lon: number) => {
  const { error } = await supabase.rpc('set_client_location', { lat, lon });
  if (error) throw error;
};

export const setMerchantLocation = async (lat: number, lon: number) => {
  const { error } = await supabase.rpc('set_merchant_location', { lat, lon });
  if (error) throw error;
};

// Offer functions
export const createOffer = async (offerData: {
  title: string;
  description: string;
  price_before: number;
  price_after: number;
  available_from: string;
  available_until: string;
  lat: number;
  lon: number;
}) => {
  const { data, error } = await supabase.rpc('create_offer', offerData);
  if (error) throw error;
  return data;
};

export const getNearbyOffers = async (lat: number, lon: number, radius_km: number = 3) => {
  const { data, error } = await supabase.rpc('nearby_offers', { lat, lon, radius_km });
  if (error) throw error;
  return data;
};

export const getGenericOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .limit(12);
  if (error) throw error;
  return data;
};

// Profile functions
export const getClientProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getMerchantProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const upsertClientProfile = async (profile: any) => {
  const { data, error } = await supabase
    .from('clients')
    .upsert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const upsertMerchantProfile = async (profile: any) => {
  const { data, error } = await supabase
    .from('merchants')
    .upsert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Merchant offers management
export const getMerchantOffers = async (merchantId: string) => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const toggleOfferActive = async (offerId: string, isActive: boolean) => {
  const { error } = await supabase
    .from('offers')
    .update({ is_active: isActive })
    .eq('id', offerId);
  if (error) throw error;
};

export const deleteOffer = async (offerId: string) => {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', offerId);
  if (error) throw error;
};