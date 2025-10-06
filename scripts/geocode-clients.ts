// ✅ Chargement des variables d'environnement (.env)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// 🔗 Lecture des clés depuis .env
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ Missing Supabase URL or key. Check your .env file.');
}

// 🌍 API Nominatim
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'resqfood-geocoder/1.0 (contact@example.com)';
const RATE_LIMIT_DELAY_MS = 1000;

interface Client {
  id: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

interface NominatimResponse {
  lat: string;
  lon: string;
}

interface GeocodeStats {
  total: number;
  success: number;
  not_found: number;
  http_error: number;
  skipped: number;
}

// 🔗 Connexion à Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 🕐 Pause (1 requête / seconde)
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🏗️ Construction de l’adresse complète
function buildAddress(client: Client): string | null {
  const parts = [client.street, client.postal_code, client.city, client.country].filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(', ');
}

// 🌍 Appel API Nominatim
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${NOMINATIM_BASE_URL}?q=${encodedAddress}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: NominatimResponse[] = await response.json();
    if (data.length === 0 || !data[0].lat || !data[0].lon) return null;

    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (error) {
    throw error;
  }
}

// 📍 Mise à jour client dans Supabase
async function updateClientLocation(
  clientId: string,
  coords: { lat: number; lon: number } | null,
  status: 'success' | 'not_found' | 'http_error'
): Promise<void> {
  if (coords && status === 'success') {
    // Utiliser RPC pour mettre à jour avec PostGIS
    const { error } = await supabase.rpc('update_client_location', {
      client_id: clientId,
      longitude: coords.lon,
      latitude: coords.lat,
      status: status
    });

    if (error) {
      console.error(`Failed to update client ${clientId}:`, error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('clients')
      .update({
        geocode_status: status,
        geocoded_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) {
      console.error(`Failed to update client ${clientId} status:`, error);
      throw error;
    }
  }
}

// 🚀 Fonction principale
async function geocodeClients(): Promise<void> {
  console.log('🚀 Starting geocoding process...\n');

  const { data: clients, error: fetchError } = await supabase
    .from('clients')
    .select('id, street, city, postal_code, country')
    .is('location', null);

  if (fetchError) {
    console.error('❌ Failed to fetch clients:', fetchError);
    return;
  }

  if (!clients || clients.length === 0) {
    console.log('✅ No clients need geocoding. All done!');
    return;
  }

  console.log(`📍 Found ${clients.length} clients to geocode\n`);

  const stats: GeocodeStats = {
    total: clients.length,
    success: 0,
    not_found: 0,
    http_error: 0,
    skipped: 0
  };

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const address = buildAddress(client);

    console.log(`[${i + 1}/${clients.length}] Processing client ${client.id}...`);

    if (!address) {
      console.log('  ⚠️ Skipped: No address components available');
      stats.skipped++;
      continue;
    }

    console.log(`  📬 Address: ${address}`);

    try {
      const coords = await geocodeAddress(address);

      if (coords) {
        await updateClientLocation(client.id, coords, 'success');
        console.log(`  ✅ Success: ${coords.lat}, ${coords.lon}`);
        stats.success++;
      } else {
        await updateClientLocation(client.id, null, 'not_found');
        console.log('  ❌ Not found');
        stats.not_found++;
      }
    } catch (error) {
      console.log('  ⚠️ HTTP Error:', (error as Error).message);
      try {
        await updateClientLocation(client.id, null, 'http_error');
      } catch {
        console.log('  ⚠️ Failed to update error status');
      }
      stats.http_error++;
    }

    if (i < clients.length - 1) await sleep(RATE_LIMIT_DELAY_MS);
    console.log('');
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 GEOCODING SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Total processed:  ${stats.total}`);
  console.log(`✅ Success:       ${stats.success}`);
  console.log(`❌ Not found:     ${stats.not_found}`);
  console.log(`⚠️ HTTP errors:   ${stats.http_error}`);
  console.log(`⏭️ Skipped:       ${stats.skipped}`);
  console.log('═══════════════════════════════════════\n');
}

geocodeClients().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
