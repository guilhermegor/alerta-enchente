import { type FormEvent, useState } from 'react';

import { normalizeCep } from '../../application/assess-address';
import { useFloodRiskContext } from '../../use-context';
import styles from '../styles.module.css';

const ERROR_ID = 'cep-erro';

export function AddressForm() {
  const { assess, loading } = useFloodRiskContext();
  const [cep, setCep] = useState('');
  const [invalid, setInvalid] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      void assess(normalizeCep(cep));
      setInvalid(null);
    } catch (err) {
      setInvalid(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Consultar risco por CEP"
    >
      <label htmlFor="cep">CEP do endereço</label>
      <div className={styles.row}>
        <input
          id="cep"
          name="cep"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          maxLength={9}
          value={cep}
          onChange={(event) => setCep(event.target.value)}
          aria-invalid={invalid !== null}
          aria-describedby={ERROR_ID}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Consultando…' : 'Consultar risco'}
        </button>
      </div>
      <p id={ERROR_ID} className={styles.fieldError} role="alert">
        {invalid}
      </p>
    </form>
  );
}
