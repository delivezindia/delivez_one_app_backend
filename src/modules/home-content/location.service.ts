import type { Request } from 'express';
import type { LocationBarData } from './home-content.types.js';
import { getHomeStore } from './home-content.store.js';

interface GeocodeCacheItem {
  timestamp: number;
  data: LocationBarData;
}

// In-memory cache for reverse geocoding to prevent excessive external requests
const geocodeCache = new Map<string, GeocodeCacheItem>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function isPrivateIp(ip?: string): boolean {
  if (!ip) return true;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  );
}

function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const parts = forwarded.split(',');
    const first = parts[0]?.trim();
    if (first && !isPrivateIp(first)) return first;
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && !isPrivateIp(realIp)) {
    return realIp.trim();
  }
  const remote = req.socket?.remoteAddress;
  if (remote && !isPrivateIp(remote)) {
    return remote.replace(/^::ffff:/, '');
  }
  return null;
}

export async function reverseGeocodeCoords(lat: number, lng: number): Promise<LocationBarData | null> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DelivezOneDelivery/1.0 (support@delivez.com)',
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as any;
      const addr = data.address || {};

      const street = addr.road || addr.suburb || addr.neighbourhood || addr.residential || addr.building || addr.amenity || '';
      const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || 'Detected Area';
      const state = addr.state || 'India';
      const postalCode = addr.postcode || '';

      const parts = [street, city, state, postalCode].filter(Boolean);
      const addressLine = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',') || `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      const result: LocationBarData = {
        label: 'Current Location',
        addressLine,
        city,
        state,
        postalCode,
        latitude: lat,
        longitude: lng,
        isServiceable: true,
      };

      geocodeCache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    }
  } catch (error) {
    // Network or timeout, fallback to coordinate string
  }

  return null;
}

export async function detectLocationFromIp(clientIp?: string | null): Promise<LocationBarData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // If clientIp is provided and public, query it; otherwise query ip-api.com/json/ (resolves server public IP)
    const targetUrl = clientIp ? `http://ip-api.com/json/${clientIp}?fields=status,country,regionName,city,zip,lat,lon` : 'http://ip-api.com/json/?fields=status,country,regionName,city,zip,lat,lon';
    const res = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data && data.status === 'success' && typeof data.lat === 'number' && typeof data.lon === 'number') {
        // Attempt reverse-geocoding for precise neighbourhood
        const rev = await reverseGeocodeCoords(data.lat, data.lon);
        if (rev) {
          return rev;
        }

        const city = data.city || 'Detected City';
        const state = data.regionName || 'India';
        const postalCode = data.zip || '';
        const addressLine = [city, state, postalCode].filter(Boolean).join(', ');

        return {
          label: 'Current Location',
          addressLine,
          city,
          state,
          postalCode,
          latitude: data.lat,
          longitude: data.lon,
          isServiceable: true,
        };
      }
    }
  } catch {
    // Ignore IP fetch failure
  }
  return null;
}

export async function resolveUserLocation(req: Request): Promise<LocationBarData> {
  const store = getHomeStore();

  // 1. Check explicit coordinates from query or body
  const latStr = req.query.lat ?? (req.body && req.body.latitude);
  const lngStr = req.query.lng ?? (req.body && req.body.longitude);

  if (latStr && lngStr) {
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
      const geoResult = await reverseGeocodeCoords(lat, lng);
      if (geoResult) return geoResult;

      // Coordinate fallback
      return {
        label: 'Current Location',
        addressLine: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        city: 'Detected City',
        state: 'India',
        postalCode: '',
        latitude: lat,
        longitude: lng,
        isServiceable: true,
      };
    }
  }

  // 2. Check IP Geolocation
  const clientIp = getClientIp(req);
  const ipResult = await detectLocationFromIp(clientIp);
  if (ipResult) {
    return ipResult;
  }

  // 3. Fallback to store default location
  return store.location.current;
}
