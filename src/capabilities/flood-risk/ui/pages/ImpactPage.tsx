import { FloodHistory } from '../../domain/enums';
import { useFloodRiskContext } from '../../use-context';
import styles from '../styles.module.css';

const HISTORY_LABEL: Record<FloodHistory, string> = {
  [FloodHistory.High]: 'Alto',
  [FloodHistory.Medium]: 'Médio',
};

export function ImpactPage() {
  const { hotspots } = useFloodRiskContext();
  return (
    <div className={styles.page}>
      <header>
        <h1>Impacto</h1>
        <p>
          Segundo o IBGE (2018), <strong>8,27 milhões de brasileiros</strong> vivem em áreas de
          risco de enchente e deslizamento. Um aviso simples, explicado e no endereço certo ajuda a
          decidir a hora de sair.
        </p>
      </header>
      <section aria-labelledby="ods-titulo">
        <h2 id="ods-titulo">Objetivos de Desenvolvimento Sustentável</h2>
        <ul>
          <li>
            <strong>ODS 11.5</strong> — reduzir mortes e pessoas afetadas por desastres, incluindo
            os ligados à água.
          </li>
          <li>
            <strong>ODS 13.1</strong> — reforçar a resiliência e a capacidade de adaptação a riscos
            climáticos.
          </li>
        </ul>
      </section>
      <section aria-labelledby="pontos-titulo">
        <h2 id="pontos-titulo">Pontos com histórico de alagamento ({hotspots.length})</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption>Bairros usados pelo cálculo de risco (dados ilustrativos)</caption>
            <thead>
              <tr>
                <th scope="col">Bairro</th>
                <th scope="col">Cidade</th>
                <th scope="col">Histórico</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((spot) => (
                <tr key={`${spot.city}-${spot.neighbourhood}`}>
                  <td>{spot.neighbourhood}</td>
                  <td>
                    {spot.city}/{spot.state}
                  </td>
                  <td>{HISTORY_LABEL[spot.history]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
