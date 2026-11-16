import React, { useMemo } from 'react';

import { useCityLookup, useSubscribeAlert } from './application/use-cases';
import { LocalSignupRepository } from './infrastructure/local-signup-repository';
import { ViaCepCityLookup } from './infrastructure/via-cep-city-lookup';
import { AlertSignupContext, type AlertSignupContextValue } from './use-context';

export function AlertSignupProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => new LocalSignupRepository(), []);
  const lookup = useMemo(() => new ViaCepCityLookup(), []);
  const { execute, errors, saved, failure } = useSubscribeAlert(repository);
  const cityByCep = useCityLookup(lookup);

  const value = useMemo<AlertSignupContextValue>(
    () => ({ subscribe: execute, errors, saved, failure, cityByCep }),
    [execute, errors, saved, failure, cityByCep],
  );

  return <AlertSignupContext value={value}>{children}</AlertSignupContext>;
}
