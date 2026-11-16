import { createContext, useContext } from 'react';

import type { Hotspot, RiskReport } from './domain/entities';

export interface FloodRiskContextValue {
  hotspots: readonly Hotspot[];
  assess: (cep: string) => Promise<void>;
  report: RiskReport | null;
  loading: boolean;
  error: Error | null;
}

export const FloodRiskContext = createContext<FloodRiskContextValue | null>(null);

export function useFloodRiskContext(): FloodRiskContextValue {
  const ctx = useContext(FloodRiskContext);
  if (!ctx) throw new Error('useFloodRiskContext must be used within FloodRiskProvider');
  return ctx;
}
