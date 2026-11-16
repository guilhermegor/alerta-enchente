import { useCallback, useState } from 'react';

import type { AlertSignup, SignupErrors } from '../domain/entities';
import type { CityLookup, SignupRepository } from '../domain/ports';

import { digits, validateSignup } from './validate-signup';

const CEP_LENGTH = 8;

export function useSubscribeAlert(repository: SignupRepository) {
  const [errors, setErrors] = useState<SignupErrors>({});
  const [saved, setSaved] = useState(false);

  const execute = useCallback(
    async (signup: AlertSignup): Promise<void> => {
      setSaved(false);
      const result = validateSignup(signup);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors({});
      await repository.save(result.value);
      setSaved(true);
    },
    [repository],
  );

  return { execute, errors, saved };
}

/** Resolves the city once the CEP has 8 digits; null for an unknown or incomplete CEP. */
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
