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

  it('rejects a series with a missing hour instead of reading it as no rain', async () => {
    respondWith(fixtures.hourlyWithGap);

    await expect(new OpenDataSource().hourlyRainMm(fixtures.point)).rejects.toThrow(
      'Previsão de chuva indisponível.',
    );
  });
});
