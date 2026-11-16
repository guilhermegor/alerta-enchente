import {
  assessAddress,
  normalizeCep,
  rainTotals,
  relativeElevationM,
  ringAround,
} from '../application/assess-address';
import { haversineKm } from '../application/risk-score';
import type { Coordinates } from '../domain/entities';
import { RiskLevel } from '../domain/enums';
import type { FloodDataSource } from '../domain/ports';
import { HOTSPOTS } from '../infrastructure/hotspot-catalog';

import fixtures from './pipeline-fixtures.json';

const HOURS_IN_DAY = 24;
const HOURS_IN_THREE_DAYS = 72;
const PANTANAL = HOTSPOTS[0];
const { storm, rainSplit, ring, relative } = fixtures;

function fakeSource(): FloodDataSource {
  return {
    addressByCep: () => Promise.resolve(storm.address),
    locate: () => Promise.resolve({ lat: PANTANAL.lat, lon: PANTANAL.lon, approximate: false }),
    hourlyRainMm: () =>
      Promise.resolve(Array<number>(storm.hourlyMm.hours).fill(storm.hourlyMm.mmPerHour)),
    elevationsM: (points: readonly Coordinates[]) =>
      Promise.resolve(storm.elevationsM.slice(0, points.length)),
  };
}

describe('assessAddress', () => {
  it('runs the whole pipeline and lets the worst factor win', async () => {
    const report = await assessAddress(storm.cep, fakeSource(), HOTSPOTS);

    expect(report.factors).toMatchObject(storm.expected);
    expect(report.factors.nearbyHotspot?.hotspot.neighbourhood).toBe(PANTANAL.neighbourhood);
    expect(report.assessment.level).toBe(RiskLevel.VeryHigh);
  });

  it('ignores terrain and history when only the city centre was found', async () => {
    const source = {
      ...fakeSource(),
      locate: () => Promise.resolve({ lat: PANTANAL.lat, lon: PANTANAL.lon, approximate: true }),
    };
    const report = await assessAddress(storm.cep, source, HOTSPOTS);

    expect(report.factors).toMatchObject({ relativeElevationM: 0, nearbyHotspot: null });
  });

  it('rejects a malformed CEP before calling any service', async () => {
    await expect(assessAddress(fixtures.badCep, fakeSource(), HOTSPOTS)).rejects.toThrow(
      '8 dígitos',
    );
  });
});

describe('pipeline helpers', () => {
  it('normalizes a masked CEP to digits', () => {
    expect(normalizeCep(fixtures.maskedCep.raw)).toBe(fixtures.maskedCep.digits);
  });

  it('sums the first 24 and 72 hours of rain', () => {
    const hourly = [
      ...Array<number>(HOURS_IN_DAY).fill(rainSplit.firstDayMmPerHour),
      ...Array<number>(HOURS_IN_THREE_DAYS - HOURS_IN_DAY).fill(rainSplit.laterMmPerHour),
    ];

    expect(rainTotals(hourly)).toEqual(rainSplit.expected);
  });

  it('places the ring samples at the requested radius', () => {
    const distances = ringAround(ring.center, ring.radiusKm).map((point) =>
      haversineKm(ring.center, point),
    );

    expect(distances.every((km) => Math.abs(km - ring.radiusKm) < ring.toleranceKm)).toBe(true);
  });

  it('measures the address against the mean of its surroundings', () => {
    expect(relativeElevationM(relative.elevationsM)).toBe(relative.expected);
  });

  it('refuses to compare without surroundings', () => {
    expect(() => relativeElevationM(relative.lonely)).toThrow('Altitudes insuficientes');
  });
});
