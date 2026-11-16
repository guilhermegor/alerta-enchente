import { Link } from 'react-router';

import illustration from '@/shared/assets/rain-city.svg';

import styles from './pages.module.css';

export function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1>Vai alagar na minha rua?</h1>
          <p>
            Digite o CEP e veja, em segundos, o risco de enchente do seu endereço nos próximos dias,
            com o motivo de cada fator: chuva prevista, relevo e histórico do bairro.
          </p>
          <Link className={styles.cta} to="/consulta">
            Consultar meu endereço
          </Link>
        </div>
        <img
          src={illustration}
          alt="Ilustração de chuva forte sobre uma rua alagada"
          width={320}
          height={160}
        />
      </section>
      <section aria-labelledby="quem-titulo">
        <h2 id="quem-titulo">Para quem é</h2>
        <p>
          Para o morador de área de risco que recebe alertas genéricos por cidade e não sabe se o
          aviso vale para a rua dele. O alerta aqui é por endereço e explicado em português simples.
        </p>
      </section>
      <section aria-labelledby="problema-titulo">
        <h2 id="problema-titulo">O problema</h2>
        <p>
          <strong>8,27 milhões de pessoas</strong> vivem em áreas de risco de enchente e
          deslizamento no Brasil (IBGE, 2018). As enchentes do Rio Grande do Sul em 2024 mostraram
          que o aviso precisa chegar antes, e precisa ser entendido.
        </p>
      </section>
      <section aria-labelledby="como-titulo">
        <h2 id="como-titulo">Como funciona</h2>
        <ol className={styles.steps}>
          <li>O CEP vira endereço (ViaCEP) e coordenadas (OpenStreetMap).</li>
          <li>Buscamos a chuva prevista para 24h e 72h e o relevo ao redor (Open-Meteo).</li>
          <li>Comparamos com os limites de alerta do INMET e com bairros que já alagaram.</li>
          <li>O pior fator define o nível: baixo, moderado, alto ou muito alto.</li>
        </ol>
      </section>
    </div>
  );
}
