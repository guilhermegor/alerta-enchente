import type { Coordinates, Hotspot, RainTotals, RiskFactors, RiskReport } from '../domain/entities';
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

type Surroundings = Pick<RiskFactors, 'relativeElevationM' | 'nearbyHotspot'>;

/** With only the city centre, terrain and neighbourhood history would describe the wrong place. */
const UNKNOWN_SURROUNDINGS: Surroundings = { relativeElevationM: 0, nearbyHotspot: null };

/**
 * The whole pipeline: CEP → address → location → rain + surroundings → level.
 * Rain and surroundings are fetched in parallel; both depend only on the location.
 */
export async function assessAddress(
  cep: string,
  source: FloodDataSource,
  hotspots: readonly Hotspot[],
): Promise<RiskReport> {
  const address = await source.addressByCep(normalizeCep(cep));
  const location = await source.locate(address);
  const [hourly, surroundings] = await Promise.all([
    source.hourlyRainMm(location),
    location.approximate ? UNKNOWN_SURROUNDINGS : readSurroundings(location, source, hotspots),
  ]);
  const factors = { ...rainTotals(hourly), ...surroundings };
  return { address, location, factors, assessment: riskScore(factors) };
}

async function readSurroundings(
  point: Coordinates,
  source: FloodDataSource,
  hotspots: readonly Hotspot[],
): Promise<Surroundings> {
  const elevations = await source.elevationsM([point, ...ringAround(point, RING_RADIUS_KM)]);
  return {
    relativeElevationM: relativeElevationM(elevations),
    nearbyHotspot: nearestHotspot(point, hotspots, HOTSPOT_RADIUS_KM),
  };
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
