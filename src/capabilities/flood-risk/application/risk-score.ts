import type {
  Coordinates,
  Hotspot,
  NearbyHotspot,
  RiskAssessment,
  RiskFactors,
} from '../domain/entities';
import { FloodHistory, RiskLevel } from '../domain/enums';

const LEVELS_BY_INDEX: readonly RiskLevel[] = [
  RiskLevel.Low,
  RiskLevel.Moderate,
  RiskLevel.High,
  RiskLevel.VeryHigh,
];

const EARTH_RADIUS_KM = 6_371;
const DEGREES_PER_HALF_TURN = 180;

const RAIN_WATCH_MM = 30;
const RAIN_DANGER_MM = 50;
const RAIN_GREAT_DANGER_MM = 100;

const VALLEY_SHALLOW_M = -3;
const VALLEY_DEEP_M = -10;

const RAIN_STEPS: readonly ((mm: number) => boolean)[] = [
  (mm) => mm >= RAIN_WATCH_MM,
  (mm) => mm > RAIN_DANGER_MM,
  (mm) => mm > RAIN_GREAT_DANGER_MM,
];

const VALLEY_STEPS: readonly ((meters: number) => boolean)[] = [
  (meters) => meters <= VALLEY_SHALLOW_M,
  (meters) => meters <= VALLEY_DEEP_M,
];

const HISTORY_BAND: Record<FloodHistory, number> = {
  [FloodHistory.Medium]: 1,
  [FloodHistory.High]: 2,
};

export function riskScore(factors: RiskFactors): RiskAssessment {
  const rain = rainBand(factors.rain24hMm);
  const terrain = terrainBand(factors.relativeElevationM);
  const history = factors.nearbyHotspot ? HISTORY_BAND[factors.nearbyHotspot.hotspot.history] : 0;

  return {
    level: LEVELS_BY_INDEX[Math.max(rain, terrain, history)],
    reasons: explainFactors(factors, terrain),
  };
}

function explainFactors(factors: RiskFactors, terrain: number): string[] {
  const reasons = [
    `Chuva prevista: ${factors.rain24hMm.toFixed(1)} mm em 24h e ` +
      `${factors.rain72hMm.toFixed(1)} mm em 72h.`,
  ];
  if (terrain > 0) {
    reasons.push(
      `O endereço fica ${Math.abs(factors.relativeElevationM).toFixed(0)} m abaixo do entorno.`,
    );
  }
  if (factors.nearbyHotspot) {
    const { hotspot, distanceKm } = factors.nearbyHotspot;
    reasons.push(
      `A ${distanceKm.toFixed(1)} km de ${hotspot.neighbourhood}, com histórico de alagamento.`,
    );
  }
  return reasons;
}

export function rainBand(rain24hMm: number): number {
  return RAIN_STEPS.filter((step) => step(rain24hMm)).length;
}

export function terrainBand(relativeElevationM: number): number {
  return VALLEY_STEPS.filter((step) => step(relativeElevationM)).length;
}

export function nearestHotspot(
  point: Coordinates,
  hotspots: readonly Hotspot[],
  radiusKm: number,
): NearbyHotspot | null {
  const inRange = hotspots
    .map((hotspot) => ({ hotspot, distanceKm: haversineKm(point, hotspot) }))
    .filter((candidate) => candidate.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return inRange[0] ?? null;
}

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const rad = Math.PI / DEGREES_PER_HALF_TURN;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
