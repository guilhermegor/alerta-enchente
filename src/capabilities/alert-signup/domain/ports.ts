import type { AlertSignup } from './entities';

export interface CityLookup {
  /** "City/UF" for a CEP, or null when the CEP does not exist. */
  cityByCep(cep: string): Promise<string | null>;
}

export interface SignupRepository {
  save(signup: AlertSignup): Promise<void>;
}
