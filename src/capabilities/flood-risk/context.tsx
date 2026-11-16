import React, { useMemo } from 'react';

import { useAssessAddress } from './application/use-cases';
import type { FloodDataSource } from './domain/ports';
import { HOTSPOTS } from './infrastructure/hotspot-catalog';
import { OpenDataSource } from './infrastructure/open-data-source';
import { FloodRiskContext, type FloodRiskContextValue } from './use-context';

interface FloodRiskProviderProps {
  children: React.ReactNode;
  source?: FloodDataSource;
}

export function FloodRiskProvider({ children, source }: FloodRiskProviderProps) {
  const dataSource = useMemo(() => source ?? new OpenDataSource(), [source]);
  const { execute, report, loading, error } = useAssessAddress(dataSource, HOTSPOTS);

  const value = useMemo<FloodRiskContextValue>(
    () => ({ hotspots: HOTSPOTS, assess: execute, report, loading, error }),
    [execute, report, loading, error],
  );

  return <FloodRiskContext value={value}>{children}</FloodRiskContext>;
}
