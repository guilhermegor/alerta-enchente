import { useCallback, useState } from 'react';

import type { Hotspot, RiskReport } from '../domain/entities';
import type { FloodDataSource } from '../domain/ports';

import { assessAddress } from './assess-address';

export function useAssessAddress(source: FloodDataSource, hotspots: readonly Hotspot[]) {
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (cep: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        setReport(await assessAddress(cep, source, hotspots));
      } catch (err) {
        setReport(null);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [source, hotspots],
  );

  return { execute, report, loading, error };
}
