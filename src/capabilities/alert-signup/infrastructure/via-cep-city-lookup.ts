import type { CityLookup } from '../domain/ports';

const VIA_CEP_URL = 'https://viacep.com.br/ws';

interface ViaCepCity {
  localidade?: string;
  uf?: string;
  erro?: unknown;
}

export class ViaCepCityLookup implements CityLookup {
  async cityByCep(cep: string): Promise<string | null> {
    const response = await fetch(`${VIA_CEP_URL}/${cep}/json/`);
    if (!response.ok) return null;
    const data = { localidade: '', uf: '', ...((await response.json()) as ViaCepCity) };
    if ([data.erro, !data.localidade].some(Boolean)) return null;
    return `${data.localidade}/${data.uf}`;
  }
}
