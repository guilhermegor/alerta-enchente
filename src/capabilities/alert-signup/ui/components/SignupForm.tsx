import { type FocusEvent, type FormEvent, useState } from 'react';

import type { AlertSignup, SignupField } from '../../domain/entities';
import { useAlertSignupContext } from '../../use-context';
import styles from '../styles.module.css';

interface FieldProps {
  field: SignupField;
  label: string;
  type?: string;
  autoComplete?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export function SignupForm() {
  const { subscribe, saved, failure, cityByCep } = useAlertSignupContext();
  const [city, setCity] = useState('');

  async function fillCity(event: FocusEvent<HTMLInputElement>) {
    const input = event.target;
    const cep = input.value;
    const found = await cityByCep(cep);
    if (found && input.value === cep) setCity(found);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void subscribe(readForm(new FormData(event.currentTarget)));
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Cadastro de alertas"
    >
      <Field field="name" label="Nome completo" autoComplete="name" required />
      <Field field="email" label="E-mail" type="email" autoComplete="email" required />
      <Field field="phone" label="Celular com DDD (opcional)" type="tel" autoComplete="tel" />
      <Field
        field="cep"
        label="CEP"
        autoComplete="postal-code"
        required
        onBlur={(event) => void fillCity(event)}
      />
      <CityField value={city} onChange={setCity} />
      <ConsentField />
      <button type="submit">Quero receber alertas</button>
      <p className={styles.success} role="status">
        {saved ? 'Pronto! Você receberá alertas para esse CEP quando o risco subir.' : ''}
      </p>
      <p className={styles.fieldError} role="alert">
        {failure}
      </p>
    </form>
  );
}

function Field({ field, label, type = 'text', autoComplete, onBlur, required }: FieldProps) {
  const { errors } = useAlertSignupContext();
  const errorId = `${field}-erro`;
  return (
    <div className={styles.field}>
      <label htmlFor={field}>{label}</label>
      <input
        id={field}
        name={field}
        type={type}
        autoComplete={autoComplete}
        onBlur={onBlur}
        required={required}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={errorId}
      />
      <span id={errorId} className={styles.fieldError}>
        {errors[field]}
      </span>
    </div>
  );
}

function CityField({ value, onChange }: { value: string; onChange: (city: string) => void }) {
  const { errors } = useAlertSignupContext();
  return (
    <div className={styles.field}>
      <label htmlFor="city">Cidade</label>
      <input
        id="city"
        name="city"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        aria-invalid={Boolean(errors.city)}
        aria-describedby="city-erro"
      />
      <span id="city-erro" className={styles.fieldError}>
        {errors.city}
      </span>
    </div>
  );
}

function ConsentField() {
  const { errors } = useAlertSignupContext();
  return (
    <div className={styles.field}>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={Boolean(errors.consent)}
          aria-describedby="consent-erro"
        />
        Aceito receber alertas de risco de enchente para este CEP.
      </label>
      <span id="consent-erro" className={styles.fieldError}>
        {errors.consent}
      </span>
    </div>
  );
}

function readForm(data: FormData): AlertSignup {
  const text = (field: SignupField) => String(data.get(field) ?? '');
  return {
    name: text('name'),
    email: text('email'),
    phone: text('phone'),
    cep: text('cep'),
    city: text('city'),
    consent: data.get('consent') !== null,
  };
}
