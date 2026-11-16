import type { FloodHistory, RiskLevel } from './enums';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Hotspot extends Coordinates {
  neighbourhood: string;
  city: string;
  state: string;
  history: FloodHistory;
}

export interface NearbyHotspot {
  hotspot: Hotspot;
  distanceKm: number;
}

export interface RiskFactors {
  rain24hMm: number;
  rain72hMm: number;
  /** Address altitude minus the mean of its surroundings; negative means a valley. */
  relativeElevationM: number;
  nearbyHotspot: NearbyHotspot | null;
}

export interface RiskAssessment {
  level: RiskLevel;
  reasons: string[];
}

export interface Address {
  cep: string;
  street: string;
  neighbourhood: string;
  city: string;
  state: string;
}

export interface RainTotals {
  rain24hMm: number;
  rain72hMm: number;
}

export interface RiskReport {
  address: Address;
  coordinates: Coordinates;
  factors: RiskFactors;
  assessment: RiskAssessment;
}
