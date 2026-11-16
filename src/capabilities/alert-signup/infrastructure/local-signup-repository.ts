import type { AlertSignup } from '../domain/entities';
import type { SignupRepository } from '../domain/ports';

const STORAGE_KEY = 'alerta-enchente:inscricoes';

export class LocalSignupRepository implements SignupRepository {
  save(signup: AlertSignup): Promise<void> {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AlertSignup[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored, signup]));
    return Promise.resolve();
  }
}
