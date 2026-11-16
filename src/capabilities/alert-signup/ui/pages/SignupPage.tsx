import { SignupForm } from '../components/SignupForm';
import styles from '../styles.module.css';

export function SignupPage() {
  return (
    <div className={styles.page}>
      <header>
        <h1>Receba alertas</h1>
        <p>
          Cadastre seu CEP e avisamos quando a previsão de chuva colocar seu endereço em risco alto.
        </p>
      </header>
      <SignupForm />
    </div>
  );
}
