import type { RiskReport } from '../../domain/entities';
import { useFloodRiskContext } from '../../use-context';
import styles from '../styles.module.css';

import { LevelBadge } from './LevelBadge';

export function RiskResult() {
  const { report, error } = useFloodRiskContext();
  return (
    <section className={styles.result} aria-live="polite" aria-labelledby="resultado-titulo">
      <h2 id="resultado-titulo">Resultado</h2>
      {error && (
        <p className={styles.fieldError}>{error.message} Use o simulador abaixo enquanto isso.</p>
      )}
      {report ? <ReportCard report={report} /> : <p>Digite um CEP para ver o risco do endereço.</p>}
    </section>
  );
}

function ReportCard({ report }: { report: RiskReport }) {
  const { address, assessment } = report;
  return (
    <article className={styles.card}>
      <p>
        {[address.street, address.neighbourhood, `${address.city}/${address.state}`]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <LevelBadge level={assessment.level} />
      <h3>Por quê</h3>
      <ul>
        {assessment.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </article>
  );
}
