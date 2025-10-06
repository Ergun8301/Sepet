import { supabase } from '../lib/supabaseClient';

export interface Reservation {
  id: string;
  client_id: string;
  merchant_id: string;
  offer_id: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
  offer?: {
    title: string;
    description: string;
    price_after: number;
    image_url: string | null;
  };
  merchant?: {
    company_name: string;
    city: string;
  };
  client?: {
    first_name: string;
    last_name: string;
  };
}

export const createReservation = async (offerId: string, merchantId: string, quantity: number = 1) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        client_id: user.id,
        merchant_id: merchantId,
        offer_id: offerId,
        quantity: quantity,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      return { success: false, error: error.message };
    }

    console.log('Reservation created:', data);
    return { success: true, data };
  } catch (err: any) {
    console.error('Exception creating reservation:', err);
    return { success: false, error: err.message };
  }
};

export const getClientReservations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        offer:offers(title, description, price_after, image_url),
        merchant:merchants(company_name, city)
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client reservations:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Exception fetching client reservations:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const getMerchantReservations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        offer:offers(title, description, price_after, image_url),
        client:clients(first_name, last_name)
      `)
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchant reservations:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Exception fetching merchant reservations:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const updateReservationStatus = async (
  reservationId: string,
  status: 'confirmed' | 'cancelled' | 'expired'
) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating reservation status:', error);
      return { success: false, error: error.message };
    }

    console.log('Reservation status updated:', data);
    return { success: true, data };
  } catch (err: any) {
    console.error('Exception updating reservation status:', err);
    return { success: false, error: err.message };
  }
};

export const cancelReservation = async (reservationId: string) => {
  return updateReservationStatus(reservationId, 'cancelled');
};

export const confirmReservation = async (reservationId: string) => {
  return updateReservationStatus(reservationId, 'confirmed');
};
