import { useCallback, useState } from 'react';

import type { AlertSignup, SignupErrors } from '../domain/entities';
import type { CityLookup, SignupRepository } from '../domain/ports';

import { digits, validateSignup } from './validate-signup';

const CEP_LENGTH = 8;
const SAVE_FAILED = 'Não conseguimos salvar o cadastro neste navegador. Tente novamente.';

export function useSubscribeAlert(repository: SignupRepository) {
  const [errors, setErrors] = useState<SignupErrors>({});
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const execute = useCallback(
    async (signup: AlertSignup): Promise<void> => {
      setSaved(false);
      setFailure(null);
      const result = validateSignup(signup);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors({});
      try {
        await repository.save(result.value);
        setSaved(true);
      } catch {
        setFailure(SAVE_FAILED);
      }
    },
    [repository],
  );

  return { execute, errors, saved, failure };
}

export function useCityLookup(lookup: CityLookup) {
  return useCallback(
    async (cep: string): Promise<string | null> => {
      const cleanCep = digits(cep);
      if (cleanCep.length !== CEP_LENGTH) return null;
      return lookup.cityByCep(cleanCep).catch(() => null);
    },
    [lookup],
  );
}
