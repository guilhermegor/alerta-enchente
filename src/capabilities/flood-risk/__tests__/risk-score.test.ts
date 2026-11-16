import {
  haversineKm,
  nearestHotspot,
  rainBand,
  riskScore,
  terrainBand,
} from '../application/risk-score';
import type { Hotspot } from '../domain/entities';
import { RiskLevel } from '../domain/enums';
import { HOTSPOTS } from '../infrastructure/hotspot-catalog';

import fixtures from './fixtures.json';

const PANTANAL = HOTSPOTS[0];
const BANDEIRA_SP = HOTSPOTS[3];
const { places, scenarios } = fixtures;

describe('haversineKm', () => {
  it('measures São Paulo (Sé) to Rio (Centro) within tolerance', () => {
    const km = haversineKm(places.seSaoPaulo, places.centroRio);
    expect(Math.abs(km - fixtures.saoPauloToRioKm)).toBeLessThan(fixtures.distanceToleranceKm);
  });
});

describe('nearestHotspot', () => {
  it('finds Jardim Pantanal for a point inside it', () => {
    const found = nearestHotspot(places.insidePantanal, HOTSPOTS, fixtures.hotspotRadiusKm);
    expect(found?.hotspot).toBe(PANTANAL);
  });

  it('returns null when nothing is within the radius (Brasília)', () => {
    expect(nearestHotspot(places.brasilia, HOTSPOTS, fixtures.hotspotRadiusKm)).toBeNull();
  });
});

describe('catalog', () => {
  it('has the minimum number of records the brief requires', () => {
    expect(HOTSPOTS.length).toBeGreaterThanOrEqual(fixtures.minimumCatalogSize);
  });
});

describe('rainBand', () => {
  it.each(fixtures.rainBands)('maps %p mm to band %p on the INMET thresholds', (mm, band) => {
    expect(rainBand(mm)).toBe(band);
  });
});

describe('terrainBand', () => {
  it.each(fixtures.terrainBands)('maps %p m relative elevation to band %p', (meters, band) => {
    expect(terrainBand(meters)).toBe(band);
  });
});

function scenarioNear(
  scenario: {
    rain24hMm: number;
    rain72hMm: number;
    relativeElevationM: number;
    hotspotDistanceKm: number;
  },
  hotspot: Hotspot,
) {
  const { hotspotDistanceKm, ...rest } = scenario;
  return riskScore({ ...rest, nearbyHotspot: { hotspot, distanceKm: hotspotDistanceKm } });
}

describe('riskScore', () => {
  it('is low on a dry day on high ground', () => {
    const { expectedReasons, ...factors } = scenarios.dryHighGround;
    const result = riskScore({ ...factors, nearbyHotspot: null });
    expect(result.level).toBe(RiskLevel.Low);
    expect(result.reasons).toHaveLength(expectedReasons);
  });

  it('is very high with heavy rain in a valley next to a hotspot, explaining all three factors', () => {
    const { expectedReasons, ...scenario } = scenarios.stormInValley;
    const result = scenarioNear(scenario, PANTANAL);
    expect(result.level).toBe(RiskLevel.VeryHigh);
    expect(result.reasons).toHaveLength(expectedReasons);
  });

  it('does not add medium factors up: the worst one wins', () => {
    expect(scenarioNear(scenarios.mediumFactors, BANDEIRA_SP).level).toBe(RiskLevel.Moderate);
  });

  it('stays high on a dry day next to a high-history hotspot', () => {
    expect(scenarioNear(scenarios.dryNearPantanal, PANTANAL).level).toBe(RiskLevel.High);
  });
});
