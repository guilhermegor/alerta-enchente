import { useEffect, useState } from 'react';

import styles from './layout.module.css';

const MAX_FONT_STEP = 3;
const FONT_KEY = 'alerta-enchente:fonte';
const CONTRAST_KEY = 'alerta-enchente:contraste';

export function AccessibilityBar() {
  const [fontStep, setFontStep] = useState(() => Number(readSetting(FONT_KEY) ?? 0));
  const [highContrast, setHighContrast] = useState(() => readSetting(CONTRAST_KEY) === 'true');

  useEffect(() => {
    document.documentElement.dataset.fontStep = String(fontStep);
    document.documentElement.dataset.contrast = highContrast ? 'high' : 'normal';
    writeSetting(FONT_KEY, String(fontStep));
    writeSetting(CONTRAST_KEY, String(highContrast));
  }, [fontStep, highContrast]);

  return (
    <div className={styles.a11yBar} role="group" aria-label="Acessibilidade">
      <button
        type="button"
        onClick={() => setFontStep(Math.max(0, fontStep - 1))}
        aria-label="Diminuir fonte"
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => setFontStep(Math.min(MAX_FONT_STEP, fontStep + 1))}
        aria-label="Aumentar fonte"
      >
        A+
      </button>
      <button
        type="button"
        aria-pressed={highContrast}
        onClick={() => setHighContrast(!highContrast)}
      >
        Alto contraste
      </button>
    </div>
  );
}

function readSetting(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSetting(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
