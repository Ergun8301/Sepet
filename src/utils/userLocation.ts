import { supabase } from '../lib/supabaseClient';
import { ewkbPointToLatLng } from './ewkb';

/**
 * Get current user's position with cascade fallback strategy:
 * 1. Try clients table by user.id
 * 2. Fallback to clients table by user.email
 * 3. Fallback to browser geolocation API
 *
 * Returns null if all methods fail
 * Does NOT write to database - frontend only
 */
export async function getCurrentUserPosition(): Promise<{ lat: number; lon: number } | null> {
  try {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Step 1: Try to get location from clients table by ID
    let { data: client } = await supabase
      .from('clients')
      .select('location, email')
      .eq('id', user.id)
      .maybeSingle();

    // Step 2: Fallback to email lookup if not found or no location
    if (!client || !client.location) {
      const { data: clientByEmail } = await supabase
        .from('clients')
        .select('location, email')
        .eq('email', user.email)
        .maybeSingle();

      if (clientByEmail) {
        client = clientByEmail;
      }
    }

    // Step 3: Decode EWKB if we have a location
    if (client?.location) {
      const position = ewkbPointToLatLng(client.location as unknown as string);
      if (position) {
        return position;
      }
    }

    // Step 4: Fallback to browser geolocation API
    if ('geolocation' in navigator) {
      return await new Promise<{ lat: number; lon: number } | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000 // Cache for 1 minute
          }
        );
      });
    }

    return null;
  } catch (error) {
    console.error('Error getting user position:', error);
    return null;
  }
}

/**
 * Request browser geolocation (standalone function)
 * Useful for "Use my current location" button
 */
export async function requestBrowserGeolocation(): Promise<{ lat: number; lon: number } | null> {
  if (!('geolocation' in navigator)) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0 // Force fresh location
      }
    );
  });
}

/**
 * Check if geolocation is available in browser
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}
