import { validateSignup } from '../application/validate-signup';
import type { AlertSignup } from '../domain/entities';

const VALID: AlertSignup = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  phone: '(11) 98765-4321',
  cep: '01310-100',
  city: 'São Paulo/SP',
  consent: true,
};

describe('validateSignup', () => {
  it('accepts a complete sign-up and strips masks', () => {
    expect(validateSignup(VALID)).toEqual({
      ok: true,
      value: { ...VALID, phone: '11987654321', cep: '01310100' },
    });
  });

  it('accepts an empty optional phone', () => {
    expect(validateSignup({ ...VALID, phone: '' }).ok).toBe(true);
  });

  it('reports every invalid field at once', () => {
    const result = validateSignup({
      name: 'Al',
      email: 'x@',
      phone: '123',
      cep: '1',
      city: ' ',
      consent: false,
    });

    expect(result.ok ? [] : Object.keys(result.errors).sort()).toEqual([
      'cep',
      'city',
      'consent',
      'email',
      'name',
      'phone',
    ]);
  });
});
