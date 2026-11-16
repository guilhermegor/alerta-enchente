import type { Coordinates, Hotspot, RainTotals, RiskReport } from '../domain/entities';
import type { FloodDataSource } from '../domain/ports';

import { nearestHotspot, riskScore } from './risk-score';

const HOURS_IN_DAY = 24;
const HOURS_IN_THREE_DAYS = 72;
const KM_PER_DEGREE_LAT = 111.32;
const DEGREES_PER_HALF_TURN = 180;
const CEP_DIGITS = 8;

/** How far the four "surroundings" samples sit from the address. */
export const RING_RADIUS_KM = 0.5;
/** A hotspot counts when the address is this close to it. */
export const HOTSPOT_RADIUS_KM = 2;

/**
 * The whole pipeline: CEP → address → coordinates → rain + terrain → level.
 * Rain and terrain are fetched in parallel; both depend only on the coordinates.
 */
export async function assessAddress(
  cep: string,
  source: FloodDataSource,
  hotspots: readonly Hotspot[],
): Promise<RiskReport> {
  const address = await source.addressByCep(normalizeCep(cep));
  const coordinates = await source.locate(address);
  const [hourly, elevations] = await Promise.all([
    source.hourlyRainMm(coordinates),
    source.elevationsM([coordinates, ...ringAround(coordinates, RING_RADIUS_KM)]),
  ]);
  const factors = {
    ...rainTotals(hourly),
    relativeElevationM: relativeElevationM(elevations),
    nearbyHotspot: nearestHotspot(coordinates, hotspots, HOTSPOT_RADIUS_KM),
  };
  return { address, coordinates, factors, assessment: riskScore(factors) };
}

/** Digits only; throws on anything that is not 8 digits. */
export function normalizeCep(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== CEP_DIGITS) throw new Error('CEP deve ter 8 dígitos.');
  return digits;
}

export function rainTotals(hourlyMm: readonly number[]): RainTotals {
  return {
    rain24hMm: sum(hourlyMm.slice(0, HOURS_IN_DAY)),
    rain72hMm: sum(hourlyMm.slice(0, HOURS_IN_THREE_DAYS)),
  };
}

/** North, east, south and west of `point`, `radiusKm` away. */
export function ringAround(point: Coordinates, radiusKm: number): Coordinates[] {
  const dLat = radiusKm / KM_PER_DEGREE_LAT;
  const dLon =
    radiusKm / (KM_PER_DEGREE_LAT * Math.cos((point.lat * Math.PI) / DEGREES_PER_HALF_TURN));
  return [
    { lat: point.lat + dLat, lon: point.lon },
    { lat: point.lat, lon: point.lon + dLon },
    { lat: point.lat - dLat, lon: point.lon },
    { lat: point.lat, lon: point.lon - dLon },
  ];
}

/** First elevation is the address; the rest are its surroundings. Negative = valley. */
export function relativeElevationM([center, ...ring]: readonly number[]): number {
  if (center === undefined || ring.length === 0) throw new Error('Altitudes insuficientes.');
  return center - sum(ring) / ring.length;
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
