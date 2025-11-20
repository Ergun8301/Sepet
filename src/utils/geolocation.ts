/**
 * Wrapper intelligent de géolocalisation
 * - Utilise @capacitor/geolocation dans l'app native
 * - Utilise navigator.geolocation sur le web
 * - Garde la même API pour une compatibilité totale
 */

import { Capacitor } from '@capacitor/core';
import { Geolocation as CapacitorGeolocation } from '@capacitor/geolocation';

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Obtenir la position actuelle de l'utilisateur
 * Compatible avec navigator.geolocation.getCurrentPosition()
 */
export async function getCurrentPosition(
  options?: GeolocationOptions
): Promise<GeolocationPosition> {
  const isNative = Capacitor.isNativePlatform();

  console.log(`📍 Géolocalisation via ${isNative ? 'Capacitor (native)' : 'navigator.geolocation (web)'}`);

  if (isNative) {
    // 🔹 MODE NATIVE : Utiliser @capacitor/geolocation
    try {
      // Demander les permissions
      const permissionStatus = await CapacitorGeolocation.checkPermissions();
      console.log('📍 Permissions actuelles:', permissionStatus);

      if (permissionStatus.location !== 'granted') {
        console.log('📍 Demande de permissions...');
        const requestResult = await CapacitorGeolocation.requestPermissions();
        console.log('📍 Résultat demande permissions:', requestResult);

        if (requestResult.location !== 'granted') {
          throw {
            code: 1,
            message: 'Permissions refusées',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationError;
        }
      }

      // Obtenir la position
      const position = await CapacitorGeolocation.getCurrentPosition({
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 0,
      });

      console.log('✅ Position obtenue (Capacitor):', position);

      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        },
        timestamp: position.timestamp,
      };
    } catch (error: any) {
      console.error('❌ Erreur géolocalisation Capacitor:', error);

      // Normaliser l'erreur pour correspondre à l'API Web
      throw {
        code: error.code || 2,
        message: error.message || 'Position non disponible',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationError;
    }
  } else {
    // 🌐 MODE WEB : Utiliser navigator.geolocation
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 2,
          message: 'Géolocalisation non supportée',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationError);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Position obtenue (Web):', position);
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            },
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('❌ Erreur géolocalisation Web:', error);
          reject({
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationError);
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 0,
        }
      );
    });
  }
}

/**
 * Vérifier si la géolocalisation est disponible
 */
export function isGeolocationAvailable(): boolean {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // Sur native, Capacitor gère toujours la géolocalisation
    return true;
  } else {
    // Sur web, vérifier navigator.geolocation
    return 'geolocation' in navigator;
  }
}

/**
 * Vérifier les permissions (utile pour l'UI)
 */
export async function checkPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const status = await CapacitorGeolocation.checkPermissions();
      return status.location as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      return 'denied';
    }
  } else {
    // Sur le web, on ne peut pas vérifier sans déclencher la demande
    // On retourne 'prompt' par défaut
    return 'prompt';
  }
}
