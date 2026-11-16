import { rainTotals } from '../application/assess-address';
import { OpenDataSource } from '../infrastructure/open-data-source';

import fixtures from './open-data-source-fixtures.json';

function respondWith(precipitation: (number | null)[]) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ hourly: { precipitation } }),
  });
  global.fetch = fetchMock;
  return fetchMock;
}

describe('OpenDataSource.hourlyRainMm', () => {
  it('requests one extra hour and drops the elapsed one', async () => {
    const fetchMock = respondWith(fixtures.hourlyWithElapsedHour);

    const hourly = await new OpenDataSource().hourlyRainMm(fixtures.point);

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('forecast_hours')).toBe(fixtures.requestedHours);
    expect(hourly).toHaveLength(fixtures.nextHours);
    expect(hourly).not.toContain(fixtures.elapsedHourMm);
  });

  it('sums the 24 h and 72 h windows from the first hour still ahead', async () => {
    const { boundary } = fixtures;
    respondWith(boundary.hourly);

    const hourly = await new OpenDataSource().hourlyRainMm(fixtures.point);

    expect(hourly[0]).toBe(boundary.firstNextHourMm);
    expect(hourly.at(-1)).toBe(boundary.lastNextHourMm);
    expect(rainTotals(hourly)).toEqual({
      rain24hMm: boundary.rain24hMm,
      rain72hMm: boundary.rain72hMm,
    });
  });

  it('rejects a series with a missing hour instead of reading it as no rain', async () => {
    respondWith(fixtures.hourlyWithGap);

    await expect(new OpenDataSource().hourlyRainMm(fixtures.point)).rejects.toThrow(
      'Previsão de chuva indisponível.',
    );
  });
});

function nominatimDownOpenMeteoReturns(places: unknown[]) {
  global.fetch = jest.fn((url: string) =>
    Promise.resolve(
      url.includes('nominatim')
        ? {
            ok: false,
            status: fixtures.cityFallback.unavailableStatus,
            json: () => Promise.resolve([]),
          }
        : { ok: true, json: () => Promise.resolve({ results: places }) },
    ),
  ) as unknown as typeof fetch;
}

describe('OpenDataSource.locate city fallback', () => {
  const { cityFallback } = fixtures;

  it('uses Open-Meteo, filtered by state, when Nominatim is down', async () => {
    nominatimDownOpenMeteoReturns(cityFallback.places);

    await expect(new OpenDataSource().locate(cityFallback.address)).resolves.toEqual(
      cityFallback.expected,
    );
  });

  it('refuses a same-named city from another state', async () => {
    nominatimDownOpenMeteoReturns(cityFallback.otherStatePlaces);

    await expect(new OpenDataSource().locate(cityFallback.address)).rejects.toThrow(
      'Não foi possível localizar Bom Jesus/RS.',
    );
  });
});
