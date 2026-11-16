import type { AlertSignup } from '../domain/entities';
import type { SignupRepository } from '../domain/ports';

const STORAGE_KEY = 'alerta-enchente:inscricoes';

// ponytail: a prototype with no back end keeps sign-ups in this browser only;
// swap for an HTTP adapter when a real alert service exists.
export class LocalSignupRepository implements SignupRepository {
  save(signup: AlertSignup): Promise<void> {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AlertSignup[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored, signup]));
    return Promise.resolve();
  }
}
