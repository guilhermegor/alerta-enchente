import { RiskLevel } from '../../domain/enums';
import styles from '../styles.module.css';

const LEVEL_CLASS: Record<RiskLevel, string> = {
  [RiskLevel.Low]: styles.levelLow,
  [RiskLevel.Moderate]: styles.levelModerate,
  [RiskLevel.High]: styles.levelHigh,
  [RiskLevel.VeryHigh]: styles.levelVeryHigh,
};

export function LevelBadge({ level }: { level: RiskLevel }) {
  return <strong className={`${styles.badge} ${LEVEL_CLASS[level]}`}>Risco {level}</strong>;
}
