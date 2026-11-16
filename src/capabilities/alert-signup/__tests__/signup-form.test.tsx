import { act, fireEvent, render, screen } from '@testing-library/react';

import { SignupForm } from '../ui/components/SignupForm';
import { AlertSignupContext, type AlertSignupContextValue } from '../use-context';

import fixtures from './signup-form-fixtures.json';

function renderWithPendingLookup() {
  let resolveLookup: (city: string | null) => void = () => undefined;
  const value: AlertSignupContextValue = {
    subscribe: () => Promise.resolve(),
    errors: {},
    saved: false,
    failure: null,
    cityByCep: () =>
      new Promise((resolve) => {
        resolveLookup = resolve;
      }),
  };
  render(
    <AlertSignupContext value={value}>
      <SignupForm />
    </AlertSignupContext>,
  );
  const cep = screen.getByLabelText('CEP');
  fireEvent.change(cep, { target: { value: fixtures.firstCep } });
  fireEvent.blur(cep);
  return { cep, finishLookup: (city: string | null) => act(async () => resolveLookup(city)) };
}

describe('SignupForm city autofill', () => {
  it('fills the city when the CEP is unchanged', async () => {
    const { finishLookup } = renderWithPendingLookup();

    await finishLookup(fixtures.city);

    expect(screen.getByLabelText('Cidade')).toHaveValue(fixtures.city);
  });

  it('ignores a lookup that finishes after the CEP was edited', async () => {
    const { cep, finishLookup } = renderWithPendingLookup();
    fireEvent.change(cep, { target: { value: fixtures.editedCep } });

    await finishLookup(fixtures.city);

    expect(screen.getByLabelText('Cidade')).toHaveValue('');
  });

  it('keeps the city when the lookup finds nothing', async () => {
    const { finishLookup } = renderWithPendingLookup();

    await finishLookup(null);

    expect(screen.getByLabelText('Cidade')).toHaveValue('');
  });
});
