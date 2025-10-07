/**
 * EWKB (Extended Well-Known Binary) parser for PostGIS geography/geometry points
 * Decodes hex string to {lat, lon} coordinates
 *
 * Format: EWKB POINT with SRID 4326
 * - Byte order (1 byte): 0x01 = little endian
 * - Type + flags (4 bytes): includes SRID flag (0x20000000)
 * - SRID (4 bytes if flag set): typically 4326
 * - Coordinates (2 x 8 bytes): lon, lat as IEEE 754 doubles
 */
export function ewkbPointToLatLng(hex: string): { lat: number; lon: number } | null {
  if (!hex || typeof hex !== 'string') return null;

  try {
    // Convert hex string to byte array
    const hexMatch = hex.match(/.{1,2}/g);
    if (!hexMatch) return null;

    const bytes = new Uint8Array(hexMatch.map(b => parseInt(b, 16)));
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    // Read byte order (1 = little endian, 0 = big endian)
    const littleEndian = dv.getUint8(0) === 1;

    // Read type + flags (4 bytes starting at offset 1)
    const typeAndFlags = dv.getUint32(1, littleEndian);

    // Check if SRID flag is set (0x20000000)
    const HAS_SRID = (typeAndFlags & 0x20000000) !== 0;

    // Start reading coordinates after type+flags
    let offset = 5; // 1 byte order + 4 bytes type

    // Skip SRID if present (4 bytes)
    if (HAS_SRID) {
      offset += 4;
    }

    // Read coordinates as IEEE 754 doubles
    // EWKB POINT format: longitude first, then latitude
    const lon = dv.getFloat64(offset, littleEndian);
    const lat = dv.getFloat64(offset + 8, littleEndian);

    // Validate coordinates
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      // Basic sanity check for valid lat/lon ranges
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return { lat, lon };
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing EWKB:', error);
    return null;
  }
}

/**
 * Test if a value looks like EWKB hex string
 */
export function isEWKBHex(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  // EWKB hex strings typically start with 01 or 00 (byte order)
  // and are long hex strings (at least 42 characters for POINT)
  return /^[0-9a-fA-F]{42,}$/.test(value);
}
