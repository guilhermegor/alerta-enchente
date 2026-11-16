import type { Hotspot } from '../domain/entities';
import { FloodHistory } from '../domain/enums';

import rawHotspots from './hotspots.json';

// Recurring flood points reported by CGE-SP, Alerta Rio and the RS/PE civil defence.
// ponytail: approximate neighbourhood centres and a qualitative history level;
// swap hotspots.json for an official occurrence series if the group gets one.

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
