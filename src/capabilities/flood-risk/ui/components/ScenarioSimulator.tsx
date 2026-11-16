import { useState } from 'react';

import { riskScore } from '../../application/risk-score';
import { useFloodRiskContext } from '../../use-context';
import styles from '../styles.module.css';

import { LevelBadge } from './LevelBadge';

const RAIN_MAX_MM = 200;
const RAIN_STEP_MM = 5;
const TERRAIN_MIN_M = -20;
const TERRAIN_MAX_M = 10;
const INITIAL_RAIN_MM = 20;
const NO_HOTSPOT = '';
const SIMULATED_DISTANCE_KM = 1;
const MULTI_DAY_FACTOR = 1.5;

export function ScenarioSimulator() {
  const { hotspots } = useFloodRiskContext();
  const [rain, setRain] = useState(INITIAL_RAIN_MM);
  const [terrain, setTerrain] = useState(0);
  const [hotspotIndex, setHotspotIndex] = useState(NO_HOTSPOT);

  const hotspot = hotspots[Number(hotspotIndex)];
  const assessment = riskScore({
    rain24hMm: rain,
    rain72hMm: rain * MULTI_DAY_FACTOR,
    relativeElevationM: terrain,
    nearbyHotspot:
      hotspotIndex === NO_HOTSPOT ? null : { hotspot, distanceKm: SIMULATED_DISTANCE_KM },
  });

  return (
    <section className={styles.card} aria-labelledby="simulador-titulo">
      <h2 id="simulador-titulo">Simulador de cenários</h2>
      <p>Mude os fatores e veja o nível mudar. O pior fator define o risco.</p>
      <label htmlFor="chuva">Chuva em 24h: {rain} mm</label>
      <input
        id="chuva"
        type="range"
        min={0}
        max={RAIN_MAX_MM}
        step={RAIN_STEP_MM}
        value={rain}
        onChange={(event) => setRain(Number(event.target.value))}
      />
      <label htmlFor="terreno">Altura em relação ao entorno: {terrain} m</label>
      <input
        id="terreno"
        type="range"
        min={TERRAIN_MIN_M}
        max={TERRAIN_MAX_M}
        value={terrain}
        onChange={(event) => setTerrain(Number(event.target.value))}
      />
      <label htmlFor="ponto">Perto de um ponto com histórico de alagamento?</label>
      <select
        id="ponto"
        value={hotspotIndex}
        onChange={(event) => setHotspotIndex(event.target.value)}
      >
        <option value={NO_HOTSPOT}>Não</option>
        {hotspots.map((spot, index) => (
          <option key={`${spot.city}-${spot.neighbourhood}`} value={index}>
            {spot.neighbourhood} ({spot.city}/{spot.state})
          </option>
        ))}
      </select>
      <div aria-live="polite">
        <LevelBadge level={assessment.level} />
        <ul>
          {assessment.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
