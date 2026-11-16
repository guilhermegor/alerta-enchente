<!-- readme-archetype: spa -->
# alerta-enchente

[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
![Node](https://img.shields.io/badge/node-%E2%89%A522-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white)
![Webpack](https://img.shields.io/badge/webpack-5-8DD6F9?logo=webpack&logoColor=white)
[![Linting](https://img.shields.io/badge/linting-eslint_|_stylelint_|_prettier-blue)](https://eslint.org)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Open Issues](https://img.shields.io/github/issues/guilhermegor/alerta-enchente)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-darkgreen.svg)

<!-- slug: overview -->
## Overview

**Alerta Enchente** é um protótipo CitizenTech (FIAP Global Solution 2026/2): a pessoa digita o CEP e vê o risco de enchente do endereço nos próximos dias — **baixo, moderado, alto ou muito alto** — com o motivo de cada fator: chuva prevista, relevo do entorno e histórico de alagamento do bairro.

- **Site:** https://guilhermegor.github.io/alerta-enchente/
- **Pitch (até 3 min):** https://youtube.com/shorts/QyxdYTwA1UE
- **Abrir sem instalar nada:** baixe a entrega e dê dois cliques em `index.html` (veja [Entrega em JavaScript puro](#entrega-em-javascript-puro)).

O problema: 8,27 milhões de brasileiros vivem em áreas de risco de enchente e deslizamento (IBGE, 2018), e o alerta costuma chegar por cidade, não pela rua. A proposta conversa com os ODS 11 (meta 11.5) e 13 (meta 13.1).

### Uso de IA generativa

Usamos um assistente de IA (Claude) para:

- gerar o projeto a partir do modelo BlueprintX `react-spa-webpack`;
- escrever o código das camadas, os testes e esta documentação.

A equipe definiu o problema, escolheu a regra "o pior fator manda" e os limites do INMET, revisou cada mudança e testou o site no navegador. Os 12 bairros de `hotspots.json` são ilustrativos e estão marcados como tal na página Impacto.

<!-- slug: features -->
## Features

### Pages & Routes

- **Início** (`#/`): para quem é, o problema com dado e fonte, e como funciona.
- **Consulta** (`#/consulta`): risco por CEP, com o porquê, e um simulador de cenários que funciona offline.
- **Impacto** (`#/impacto`): ODS 11.5 e 13.1 e a tabela dos 12 bairros com histórico de alagamento.
- **Alertas** (`#/alertas`): cadastro validado em JS, com mensagens na própria página e cidade preenchida pelo CEP.
- **Equipe** (`#/equipe`): integrantes e RMs.

### Capabilities (vertical slices)

- `flood-risk`: CEP → ViaCEP → Nominatim → Open-Meteo (chuva e relevo) → `riskScore()`, em que **o pior fator manda**. As regras e os limites do INMET estão em [docs/como-funciona.md](docs/como-funciona.md).
- `alert-signup`: validação pura (`validateSignup()`) e cadastro guardado no navegador (`localStorage`).

### State Management

- Variant: **React Context** — see `src/capabilities/<feature>/context.tsx`

### UI & Accessibility

- HTML semântico (`header`, `nav`, `main`, `section`, `footer`), link "pular para o conteúdo", `label` em todos os campos, foco visível e navegação completa por teclado.
- **Diferencial:** botões de alto contraste e de tamanho de fonte (A-/A+), lembrados entre visitas.
- Layout responsivo com grid, flexbox e media queries, sem rolagem horizontal a partir de 320 px.

### Testing

- Unit / component: **Jest + React Testing Library**
- End-to-end: **Playwright** (chromium)

<!-- slug: getting-started -->
## Getting Started

<!-- slug: install -->
### Install

#### Prerequisites

- Node ≥ 22 — the exact version is pinned in `.nvmrc` (`nvm use` / `fnm use`)
- npm (bundled with Node) — pnpm / yarn also work
- A modern browser for development (Chrome, Firefox, Safari)

Clone and install:

```bash
git clone https://github.com/guilhermegor/alerta-enchente.git
cd alerta-enchente
npm install
```

<!-- slug: usage -->
### Usage

```bash
npm start           # servidor de desenvolvimento em http://localhost:3000
npm run build       # build de produção em dist/ (css/, js/, img/, fonts/)
npm run delivery    # cópia em JavaScript puro + build que abre por file://
```

<!-- slug: project-structure -->
## Project Structure

```text
alerta-enchente/
├── .github/
│   ├── workflows/             # CI: build, lint, test, type-check (+ deploy-spa for Pages)
│   ├── CLAUDE.md              # guidance for adding recurrent / scheduled automation
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/                    # pre-commit / pre-push hooks
├── .specs/
│   ├── CLAUDE.md               # layout rules + spec template (US-/AC-/ASM-/Q-XXX ids)
│   └── features/               # one subfolder per feature spec
├── .vscode/
├── public/
│   └── index.html             # ships <meta name="viewport"> — do not remove
├── src/
│   ├── capabilities/          # vertical slices: domain / application / infrastructure / ui
│   │   └── <feature>/
│   │       ├── domain/        # entities, dto, enums, ports — no I/O, no React
│   │       ├── application/   # use-cases, factories — depends on domain only
│   │       ├── infrastructure/# adapters implementing domain ports
│   │       ├── ui/            # components, pages, styles.module.css
│   │       ├── context.tsx    # composition root — wires infra → app → React tree
│   │       └── index.ts       # public barrel
│   ├── shared/
│   │   └── styles/            # design tokens + theme
│   ├── routes/                # app-level routing
│   ├── App.tsx
│   └── index.tsx
├── tests/
│   └── e2e/                   # Playwright specs
├── .babelrc
├── .editorconfig
├── .gitignore
├── .nvmrc                     # pinned Node version (single source of truth)
├── .prettierrc.js
├── .stylelintrc.json
├── eslint.config.js
├── jest.config.cjs
├── jest.setup.ts
├── lint-staged.config.js
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── webpack.config.js
├── LICENSE
└── README.md
```

<!-- slug: development -->
## Development

### Running Tests

```bash
npm test                       # Jest + RTL (unit / component)
npm test -- --watch            # watch mode
npm run test:e2e:frontend      # Playwright e2e
npm run test:e2e:frontend:ui   # Playwright UI runner
```

### Type-check & lint

```bash
npm run type-check  # tsc --noEmit
npm run lint        # eslint --fix
```

<!-- slug: deployment -->
## Deployment

### GitHub Pages

The scaffold ships `.github/workflows/deploy-spa.yml`, which builds the SPA
with `PUBLIC_PATH=/<repo-name>/`, adds a `404.html` fallback for client-side
routes, and pushes `dist/` to `gh-pages` on every push to `main`.

**One-time setup is required** — GitHub no longer auto-enables Pages on
first `gh-pages` push. After the first successful workflow run, run:

```bash
gh api -X POST repos/guilhermegor/alerta-enchente/pages \
  -f 'source[branch]=gh-pages' -f 'source[path]=/'
```

…or enable it manually via `Settings → Pages → Source: gh-pages → /`.

O site publicado fica em https://guilhermegor.github.io/alerta-enchente/. Como as rotas usam `#`, o `404.html` não é necessário, mas não atrapalha.

### Entrega em JavaScript puro

A entrega da FIAP não pode ter TypeScript e precisa abrir com dois cliques no `index.html`. `npm run delivery` gera as duas coisas:

```bash
npm run delivery
# js-copy/src/        código-fonte em JavaScript + JSX (só os tipos são removidos)
# js-copy/dist/       site pronto: index.html + css/ + js/ + img/ + fonts/
```

`js-copy:verify` falha se sobrar qualquer arquivo `.ts`/`.tsx` ou menção a TypeScript. O build usa `HashRouter` e caminhos relativos, por isso abre direto do disco (`file://`). As consultas às APIs públicas precisam de internet; sem ela, o simulador da página Consulta continua funcionando.

Para montar o `.zip` de entrega: o site fica na raiz (`index.html`, `css/`, `js/`, `img/`), ao lado deste README, dos documentos que ele cita, do código-fonte em JavaScript e do `.txt` e do `.pdf` com o grupo, os RMs e o link do pitch (esses dois ficam fora do repositório):

```bash
npm run delivery
mkdir entrega
cp -r js-copy/dist/. README.md docs js-copy/src js-copy/public js-copy/webpack.config.js entrega/
cp grupo-42-alerta-enchente.txt grupo-42-alerta-enchente.pdf entrega/
cd entrega && zip -r ../entrega-alerta-enchente.zip . && cd ..
```

<!-- slug: contributing -->
## Contributing

See `CLAUDE.md` for the layout and gate rules; branch from `main`, use Conventional Commits,
and open a pull request.

<!-- slug: license -->
## License

This project is licensed under MIT; see [LICENSE](LICENSE).

<!-- slug: authors -->
## Authors

- guilhermegor — [GitHub](https://github.com/guilhermegor) | [LinkedIn](https://www.linkedin.com/in/guilhermegor)

### Equipe e pitch — Grupo 42

| Nome                               | RM       |
| ---------------------------------- | -------- |
| August Aguiar Gruber               | RM568809 |
| Rogerio Gajewski Piatek dos Santos | RM573884 |
| Vladimir Leal Sposito de Oliveira  | RM569159 |
| Guilherme Oliveira Rodrigues       | RM569016 |
| Nicole Rodrigues da Silva Oliveira | RM572820 |

Pitch (até 3 min): https://youtube.com/shorts/QyxdYTwA1UE

Os mesmos dados aparecem na página Equipe (`src/shared/pages/team.json`).

<!-- slug: useful-links -->
## Useful Links

- [GitHub Repository](https://github.com/guilhermegor/alerta-enchente)
- [Issue Tracker](https://github.com/guilhermegor/alerta-enchente/issues)

---

<sub>Generated from the react-spa-webpack template via [BlueprintX](https://github.com/guilhermegor/blueprintx).</sub>
