import type { AlertSignup } from './entities';

export interface CityLookup {
  cityByCep(cep: string): Promise<string | null>;
}

export interface SignupRepository {
  save(signup: AlertSignup): Promise<void>;
}
