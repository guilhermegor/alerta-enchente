import { AddressForm } from '../components/AddressForm';
import { RiskResult } from '../components/RiskResult';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import styles from '../styles.module.css';

export function LookupPage() {
  return (
    <div className={styles.page}>
      <header>
        <h1>Consulte o risco do seu endereço</h1>
        <p>
          Cruzamos a previsão de chuva (Open-Meteo), o relevo do entorno e pontos com histórico de
          alagamento. Nenhum dado seu é guardado.
        </p>
      </header>
      <AddressForm />
      <RiskResult />
      <ScenarioSimulator />
    </div>
  );
}
