import type { Hotspot } from '../domain/entities';
import { FloodHistory } from '../domain/enums';

import rawHotspots from './hotspots.json';

const HISTORY_BY_LABEL: Record<string, FloodHistory | undefined> = {
  [FloodHistory.Medium]: FloodHistory.Medium,
  [FloodHistory.High]: FloodHistory.High,
};

function toHotspot(raw: (typeof rawHotspots)[number]): Hotspot {
  const history = HISTORY_BY_LABEL[raw.history];
  if (!history)
    throw new Error(`hotspots.json: unknown history "${raw.history}" for ${raw.neighbourhood}`);
  return { ...raw, history };
}

export const HOTSPOTS: readonly Hotspot[] = rawHotspots.map(toHotspot);
