import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'resqfood-geocoder/1.0 (contact@example.com)';
const RATE_LIMIT_DELAY_MS = 1000;

interface Entity {
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildAddress(entity: Entity): string | null {
  const parts = [entity.street, entity.postal_code, entity.city, entity.country].filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(', ');
}

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

async function geocodeEntities(
  supabase: any,
  tableName: 'clients' | 'merchants',
  rpcFunctionName: string
): Promise<GeocodeStats> {
  console.log(`Starting ${tableName} geocoding...`);

  const { data: entities, error: fetchError } = await supabase
    .from(tableName)
    .select('id, street, city, postal_code, country')
    .is('location', null);

  if (fetchError) {
    console.error(`Failed to fetch ${tableName}:`, fetchError);
    throw fetchError;
  }

  if (!entities || entities.length === 0) {
    console.log(`No ${tableName} need geocoding.`);
    return { total: 0, success: 0, not_found: 0, http_error: 0, skipped: 0 };
  }

  console.log(`Found ${entities.length} ${tableName} to geocode`);

  const stats: GeocodeStats = {
    total: entities.length,
    success: 0,
    not_found: 0,
    http_error: 0,
    skipped: 0
  };

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const address = buildAddress(entity);

    if (!address) {
      stats.skipped++;
      continue;
    }

    try {
      const coords = await geocodeAddress(address);

      if (coords) {
        const { error } = await supabase.rpc(rpcFunctionName, {
          [`${tableName.slice(0, -1)}_id`]: entity.id,
          longitude: coords.lon,
          latitude: coords.lat,
          status: 'success'
        });

        if (error) {
          console.error(`Failed to update ${tableName.slice(0, -1)} ${entity.id}:`, error);
          stats.http_error++;
        } else {
          stats.success++;
        }
      } else {
        await supabase
          .from(tableName)
          .update({
            geocode_status: 'not_found',
            geocoded_at: new Date().toISOString()
          })
          .eq('id', entity.id);
        stats.not_found++;
      }
    } catch (error) {
      console.error(`HTTP Error for ${entity.id}:`, error);
      await supabase
        .from(tableName)
        .update({
          geocode_status: 'http_error',
          geocoded_at: new Date().toISOString()
        })
        .eq('id', entity.id);
      stats.http_error++;
    }

    if (i < entities.length - 1) await sleep(RATE_LIMIT_DELAY_MS);
  }

  console.log(`${tableName} geocoding complete:`, stats);
  return stats;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Starting geocoding process...');

    const clientStats = await geocodeEntities(supabase, 'clients', 'update_client_location');
    const merchantStats = await geocodeEntities(supabase, 'merchants', 'update_merchant_location');

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      clients: clientStats,
      merchants: merchantStats,
      total: {
        processed: clientStats.total + merchantStats.total,
        success: clientStats.success + merchantStats.success,
        failed: clientStats.not_found + clientStats.http_error + merchantStats.not_found + merchantStats.http_error
      }
    };

    console.log('Geocoding complete:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
