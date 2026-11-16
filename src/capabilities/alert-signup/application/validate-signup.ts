import type { AlertSignup, SignupErrors, SignupField, SignupValidation } from '../domain/entities';

const MIN_NAME_LENGTH = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10,11}$/;
const CEP_PATTERN = /^\d{8}$/;

type Rule = (signup: AlertSignup) => string | null;

const RULES: Record<SignupField, Rule> = {
  name: (s) =>
    s.name.trim().length >= MIN_NAME_LENGTH ? null : 'Informe seu nome (mínimo 3 letras).',
  email: (s) => (EMAIL_PATTERN.test(s.email.trim()) ? null : 'Informe um e-mail válido.'),
  phone: (s) =>
    s.phone === '' || PHONE_PATTERN.test(digits(s.phone))
      ? null
      : 'Telefone com DDD: 10 ou 11 dígitos.',
  cep: (s) => (CEP_PATTERN.test(digits(s.cep)) ? null : 'CEP deve ter 8 dígitos.'),
  city: (s) => (s.city.trim() ? null : 'Informe a cidade (o CEP preenche sozinho).'),
  consent: (s) => (s.consent ? null : 'É preciso aceitar receber os alertas.'),
};

/** Every rule runs, so the form can show all problems at once. Phone is optional. */
export function validateSignup(signup: AlertSignup): SignupValidation {
  const errors: SignupErrors = Object.fromEntries(
    Object.entries(RULES)
      .map(([field, rule]) => [field, rule(signup)])
      .filter(([, message]) => message !== null),
  );
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { ...signup, cep: digits(signup.cep), phone: digits(signup.phone) } };
}

export function digits(raw: string): string {
  return raw.replace(/\D/g, '');
}
