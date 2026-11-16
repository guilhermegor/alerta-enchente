import type { Address, Coordinates, Location } from '../domain/entities';
import type { FloodDataSource } from '../domain/ports';

import states from './states.json';

const VIA_CEP_URL = 'https://viacep.com.br/ws';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation';
const FORECAST_HOURS = 72;
const STREET_CLASSES = new Set(['highway', 'building']);
const SEARCH_LIMIT = '5';
const CITY_CANDIDATES = '10';
const STATE_NAMES: Record<string, string> = states;

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
  class: string;
}

interface OpenMeteoPlace {
  latitude: number;
  longitude: number;
  admin1?: string;
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
      const hit = (await searchNominatim(query)).find((found) => STREET_CLASSES.has(found.class));
      if (hit) return { ...toCoordinates(hit), approximate: false };
    }
    return { ...(await this.locateCity(address)), approximate: true };
  }

  async hourlyRainMm(point: Coordinates): Promise<number[]> {
    const params = new URLSearchParams({
      latitude: String(point.lat),
      longitude: String(point.lon),
      hourly: 'precipitation',
      forecast_hours: String(FORECAST_HOURS + 1),
      timezone: 'America/Sao_Paulo',
    });
    const data = await fetchJson<{ hourly?: { precipitation?: (number | null)[] } }>(
      `${OPEN_METEO_FORECAST_URL}?${params}`,
    );
    const hourly = data.hourly?.precipitation;
    if (!isCompleteSeries(hourly)) throw new Error('Previsão de chuva indisponível.');
    return hourly.slice(1);
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
    const point = (await nominatimCity(address)) ?? (await openMeteoCity(address));
    if (!point) throw new Error(`Não foi possível localizar ${address.city}/${address.state}.`);
    return point;
  }
}

async function searchNominatim(query: string): Promise<NominatimHit[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: SEARCH_LIMIT,
    countrycodes: 'br',
  });
  return fetchJson<NominatimHit[]>(`${NOMINATIM_URL}?${params}`).catch(() => []);
}

async function nominatimCity(address: Address): Promise<Coordinates | null> {
  const [hit] = await searchNominatim(`${address.city}, ${address.state}, Brasil`);
  return hit ? toCoordinates(hit) : null;
}

async function openMeteoCity(address: Address): Promise<Coordinates | null> {
  const params = new URLSearchParams({
    name: address.city,
    count: CITY_CANDIDATES,
    language: 'pt',
    countryCode: 'BR',
  });
  const data = await fetchJson<{ results?: OpenMeteoPlace[] }>(
    `${OPEN_METEO_GEOCODING_URL}?${params}`,
  ).catch(() => ({ results: [] }));
  const place = data.results?.find((found) => found.admin1 === STATE_NAMES[address.state]);
  return place ? { lat: place.latitude, lon: place.longitude } : null;
}

function toCoordinates(hit: NominatimHit): Coordinates {
  return { lat: Number(hit.lat), lon: Number(hit.lon) };
}

function isCompleteSeries(hourly: (number | null)[] | undefined): hourly is number[] {
  return (
    Array.isArray(hourly) &&
    hourly.length > FORECAST_HOURS &&
    hourly.every((mm) => typeof mm === 'number')
  );
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
