import { createContext, useContext } from 'react';

import type { AlertSignup, SignupErrors } from './domain/entities';

export interface AlertSignupContextValue {
  subscribe: (signup: AlertSignup) => Promise<void>;
  errors: SignupErrors;
  saved: boolean;
  failure: string | null;
  cityByCep: (cep: string) => Promise<string | null>;
}

export const AlertSignupContext = createContext<AlertSignupContextValue | null>(null);

export function useAlertSignupContext(): AlertSignupContextValue {
  const ctx = useContext(AlertSignupContext);
  if (!ctx) throw new Error('useAlertSignupContext must be used within AlertSignupProvider');
  return ctx;
}
