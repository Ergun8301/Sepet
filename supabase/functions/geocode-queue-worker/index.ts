import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'resqfood-geocoder/1.0';
const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 10;

interface QueueItem {
  id: string;
  table_name: string;
  record_id: string;
  payload: {
    address: string;
  };
  attempts: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${NOMINATIM_BASE_URL}?q=${encodedAddress}&format=json&limit=1`;

    console.log(`Geocoding address: ${address}`);

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: NominatimResponse[] = await response.json();
    if (data.length === 0 || !data[0].lat || !data[0].lon) {
      console.log(`No results found for address: ${address}`);
      return null;
    }

    const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    console.log(`Found coordinates:`, coords);
    return coords;
  } catch (error: any) {
    console.error(`Geocoding error for ${address}:`, error.message);
    throw error;
  }
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting geocode queue worker...');

    // Fetch pending items from the queue
    const { data: queueItems, error: fetchError } = await supabase
      .from('geocode_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', MAX_ATTEMPTS)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('Error fetching queue items:', fetchError);
      throw fetchError;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('No pending items in queue');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending items',
          processed: 0
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Processing ${queueItems.length} queue items`);

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const item of queueItems as QueueItem[]) {
      results.processed++;

      try {
        const address = item.payload.address;
        
        if (!address || address.trim() === ',') {
          console.log(`Skipping item ${item.id}: invalid address`);
          await supabase
            .from('geocode_queue')
            .update({ status: 'failed', attempts: item.attempts + 1 })
            .eq('id', item.id);
          results.failed++;
          continue;
        }

        // Geocode the address
        const coords = await geocodeAddress(address);

        if (coords) {
          // Update the corresponding table
          const rpcFunction = item.table_name === 'clients' 
            ? 'update_client_location' 
            : 'update_merchant_location';
          
          const idParam = item.table_name === 'clients' ? 'client_id' : 'merchant_id';

          const { error: updateError } = await supabase.rpc(rpcFunction, {
            [idParam]: item.record_id,
            longitude: coords.lon,
            latitude: coords.lat,
            status: 'success'
          });

          if (updateError) {
            console.error(`Failed to update ${item.table_name} ${item.record_id}:`, updateError);
            throw updateError;
          }

          // Mark queue item as completed
          await supabase
            .from('geocode_queue')
            .update({ status: 'completed', attempts: item.attempts + 1 })
            .eq('id', item.id);

          results.success++;
          console.log(`✓ Successfully geocoded ${item.table_name} ${item.record_id}`);
        } else {
          // Address not found
          await supabase
            .from('geocode_queue')
            .update({ status: 'failed', attempts: item.attempts + 1 })
            .eq('id', item.id);

          // Update table with not_found status
          await supabase
            .from(item.table_name)
            .update({ 
              geocode_status: 'not_found',
              geocoded_at: new Date().toISOString()
            })
            .eq('id', item.record_id);

          results.failed++;
          console.log(`✗ Address not found for ${item.table_name} ${item.record_id}`);
        }

        // Rate limiting: wait 1 second between requests
        await sleep(1000);

      } catch (error: any) {
        console.error(`Error processing item ${item.id}:`, error);
        
        // Mark as failed if max attempts reached
        const newAttempts = item.attempts + 1;
        const newStatus = newAttempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
        
        await supabase
          .from('geocode_queue')
          .update({ status: newStatus, attempts: newAttempts })
          .eq('id', item.id);

        results.failed++;
        results.errors.push({
          item_id: item.id,
          error: error.message
        });
      }
    }

    console.log('Queue processing complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('Fatal error in queue worker:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
