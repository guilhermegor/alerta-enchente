import type { MouseEvent } from 'react';
import { NavLink, Outlet } from 'react-router';

import logo from '@/shared/assets/logo.svg';

import { AccessibilityBar } from './AccessibilityBar';
import styles from './layout.module.css';

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/consulta', label: 'Consulta' },
  { to: '/impacto', label: 'Impacto' },
  { to: '/alertas', label: 'Alertas' },
  { to: '/equipe', label: 'Equipe' },
];

export function Layout() {
  return (
    <>
      <a className={styles.skipLink} href="#conteudo" onClick={focusMain}>
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="" width={32} height={32} />
          <span>Alerta Enchente</span>
        </div>
        <nav aria-label="Principal">
          <ul className={styles.nav}>
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end
                  className={({ isActive }) => (isActive ? styles.active : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <AccessibilityBar />
      </header>
      <main id="conteudo" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>
          Protótipo CitizenTech · FIAP Global Solution 2026/2 · Dados: ViaCEP, OpenStreetMap e
          Open-Meteo. Em emergência, ligue 199 (Defesa Civil).
        </p>
      </footer>
    </>
  );
}

function focusMain(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById('conteudo')?.focus();
}
