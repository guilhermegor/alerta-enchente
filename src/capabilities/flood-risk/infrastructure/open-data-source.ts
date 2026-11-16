import type { Address, Coordinates, Location } from '../domain/entities';
import type { FloodDataSource } from '../domain/ports';

const VIA_CEP_URL = 'https://viacep.com.br/ws';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation';
const FORECAST_DAYS = '3';

interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean | string;
}

const VIA_CEP_DEFAULTS: ViaCepResponse = { logradouro: '', bairro: '', localidade: '', uf: '' };

interface NominatimHit {
  lat: string;
  lon: string;
}

interface OpenMeteoGeocoding {
  results?: { latitude: number; longitude: number }[];
}

export class OpenDataSource implements FloodDataSource {
  async addressByCep(cep: string): Promise<Address> {
    const found = await fetchJson<Partial<ViaCepResponse>>(`${VIA_CEP_URL}/${cep}/json/`);
    const data = { ...VIA_CEP_DEFAULTS, ...found };
    if ([data.erro, !data.localidade, !data.uf].some(Boolean))
      throw new Error(`CEP ${cep} não encontrado.`);
    return {
      cep,
      street: data.logradouro,
      neighbourhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  }

  async locate(address: Address): Promise<Location> {
    for (const query of streetQueries(address)) {
      const hit = await this.searchStreet(query);
      if (hit) return { ...hit, approximate: false };
    }
    return { ...(await this.locateCity(address)), approximate: true };
  }

  private async searchStreet(query: string): Promise<Coordinates | null> {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'br',
    });
    const hits = await fetchJson<NominatimHit[]>(`${NOMINATIM_URL}?${params}`).catch(() => []);
    return hits[0] ? { lat: Number(hits[0].lat), lon: Number(hits[0].lon) } : null;
  }

  async hourlyRainMm(point: Coordinates): Promise<number[]> {
    const params = new URLSearchParams({
      latitude: String(point.lat),
      longitude: String(point.lon),
      hourly: 'precipitation',
      forecast_days: FORECAST_DAYS,
      timezone: 'America/Sao_Paulo',
    });
    const data = await fetchJson<{ hourly?: { precipitation?: (number | null)[] } }>(
      `${OPEN_METEO_FORECAST_URL}?${params}`,
    );
    const hourly = data.hourly?.precipitation;
    if (!hourly) throw new Error('Previsão de chuva indisponível.');
    return hourly.map((mm) => mm ?? 0);
  }

  async elevationsM(points: readonly Coordinates[]): Promise<number[]> {
    const params = new URLSearchParams({
      latitude: points.map((point) => point.lat).join(','),
      longitude: points.map((point) => point.lon).join(','),
    });
    const data = await fetchJson<{ elevation?: number[] }>(`${OPEN_METEO_ELEVATION_URL}?${params}`);
    if (data.elevation?.length !== points.length) throw new Error('Altitude indisponível.');
    return data.elevation;
  }

  private async locateCity(address: Address): Promise<Coordinates> {
    const params = new URLSearchParams({
      name: address.city,
      count: '1',
      language: 'pt',
      countryCode: 'BR',
    });
    const data = await fetchJson<OpenMeteoGeocoding>(`${OPEN_METEO_GEOCODING_URL}?${params}`);
    const hit = data.results?.[0];
    if (!hit) throw new Error(`Não foi possível localizar ${address.city}/${address.state}.`);
    return { lat: hit.latitude, lon: hit.longitude };
  }
}

function streetQueries(address: Address): string[] {
  if (!address.street) return [];
  const join = (parts: string[]) => [...parts, 'Brasil'].filter(Boolean).join(', ');
  return [
    join([address.street, address.neighbourhood, address.city, address.state]),
    join([address.street, address.city, address.state]),
  ];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Serviço indisponível (${response.status}): ${new URL(url).host}`);
  return (await response.json()) as T;
}
