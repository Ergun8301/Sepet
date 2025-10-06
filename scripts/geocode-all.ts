// ✅ Script unifié pour géocoder clients ET merchants
import 'dotenv/config';
import { geocodeClients } from './geocode-clients.js';
import { geocodeMerchants } from './geocode-merchants.js';

interface CombinedStats {
  clients: {
    total: number;
    success: number;
    not_found: number;
    http_error: number;
    skipped: number;
  };
  merchants: {
    total: number;
    success: number;
    not_found: number;
    http_error: number;
    skipped: number;
  };
}

async function geocodeAll(): Promise<CombinedStats> {
  console.log('🌍 STARTING COMPLETE GEOCODING PROCESS\n');
  console.log('═══════════════════════════════════════\n');

  const clientStats = await geocodeClients();

  console.log('\n');

  const merchantStats = await geocodeMerchants();

  const combined: CombinedStats = {
    clients: clientStats,
    merchants: merchantStats
  };

  console.log('\n\n');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║     COMPLETE GEOCODING SUMMARY        ║');
  console.log('╠═══════════════════════════════════════╣');
  console.log('║ CLIENTS:                              ║');
  console.log(`║   Total:        ${clientStats.total.toString().padStart(4)}                   ║`);
  console.log(`║   ✅ Success:    ${clientStats.success.toString().padStart(4)}                   ║`);
  console.log(`║   ❌ Not found:  ${clientStats.not_found.toString().padStart(4)}                   ║`);
  console.log(`║   ⚠️  HTTP errors: ${clientStats.http_error.toString().padStart(2)}                     ║`);
  console.log(`║   ⏭️  Skipped:    ${clientStats.skipped.toString().padStart(4)}                   ║`);
  console.log('║                                       ║');
  console.log('║ MERCHANTS:                            ║');
  console.log(`║   Total:        ${merchantStats.total.toString().padStart(4)}                   ║`);
  console.log(`║   ✅ Success:    ${merchantStats.success.toString().padStart(4)}                   ║`);
  console.log(`║   ❌ Not found:  ${merchantStats.not_found.toString().padStart(4)}                   ║`);
  console.log(`║   ⚠️  HTTP errors: ${merchantStats.http_error.toString().padStart(2)}                     ║`);
  console.log(`║   ⏭️  Skipped:    ${merchantStats.skipped.toString().padStart(4)}                   ║`);
  console.log('╚═══════════════════════════════════════╝\n');

  const totalProcessed = clientStats.total + merchantStats.total;
  const totalSuccess = clientStats.success + merchantStats.success;

  console.log(`🎉 Geocoding complete! ${totalSuccess}/${totalProcessed} locations updated successfully.\n`);

  return combined;
}

geocodeAll().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
