export interface AlertSignup {
  name: string;
  email: string;
  phone: string;
  cep: string;
  city: string;
  consent: boolean;
}

export type SignupField = keyof AlertSignup;

export type SignupErrors = Partial<Record<SignupField, string>>;

export type SignupValidation =
  { ok: true; value: AlertSignup } | { ok: false; errors: SignupErrors };
