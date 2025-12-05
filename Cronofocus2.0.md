# CronoFocus 2.0 — Release Notes & Migration Guide

## Introdução
CronoFocus 2.0 é uma revisão do CronoFocus com foco em modularização, design refinado e melhor organização do código (views, composables, CSS). Este documento descreve o que mudou, como migrar, e quais pontos checar após atualização.

---

## Resumo da Release (2.0)
- Modularização completa das principais features (FASE 2 & 3).
- Refinamento visual: Tailwind v4, glassmorphism reduzido, bordas removidas e sombras sutis.
- Performance: redução de tamanho de views e de composables, bundle estável (~532KB).
- Correções importantes: correção de `router.push` no template, guardas de rota com import dinâmico do `authStore`, IndexedDB `toCloneable`.

---

## Release Highlights
1. Modern UI
   - Gradientes atualizados para Tailwind v4 (bg-linear-to-*).
   - Glassmorphism simplificado: blur reduzido e opacidade ajustada.
   - Remoção de bordas desnecessárias, foco por anel (`focus:ring`) para inputs.

2. Arquitetura e Modularização
   - CSS modularizado em `src/assets/css/` (base, components, utilities).
   - Views grandes divididas em pequenos componentes reutilizáveis.
   - Composables separadas em módulos menores (db/ auth/ timer/ export/ notifications/).

3. Correções Críticas
   - `router.push` deve ser chamado por métodos (evitar chamar diretamente no template)
   - `authStore` foi importado dinamicamente dentro de guards de rota para evitar issues de inicialização do Pinia
   - IndexedDB: `toCloneable()` para converter objetos Vue reativos antes de salvar

---

## Arquivos e Estruturas Relevantes
- `src/assets/css/base/variables.css` — variáveis globais e padrões
- `src/assets/css/components/` — botões, cards, forms, etc.
- `src/views/` — principais views reorganizadas em componentes
- `src/composables/` — modularização dos composables em sub-pastas
- `src/stores/` — Pinia stores

---

## Migração — Checklist para Devs (Upgrade para 2.0)
1. Pull do branch `main` e instalar dependências:

```
# Instalar dependências
npm install

# Testar dev server
npm run dev
```

2. Verificar classes tailwind: substituir `bg-gradient-to-` por `bg-linear-to-` caso haja warnings.
3. Inspecionar formulários e inputs: agora usam `focus:ring-2` e não têm bordas por padrão.
4. Certifique-se de que guardas de rota importem `authStore` dinamicamente — caso contrário, os guards podem falhar em dev com Pinia.
5. Ao salvar dados no IndexedDB, utilize o utilitário `toCloneable()` para evitar erros de cloning de Proxy.
6. Rodar `npm run build` para gerar bundle de produção e verificar se warnings aparecem.

---

## Testes Recomendados (Smoke Tests)
- Login + selecionar ou criar perfil
- Criar nova tarefa → Ver se entra em `timeStore` e aparece na agenda
- Executar timer: start → pause → resume → complete
- Exportar dados (CSV/JSON/PNG)
- Importar backup (JSON) e confirmar integridade
- Conferir PWA install (mobile) e offline mode

---

## Changelog Resumido (principais commits/PRs)
- `feat(composables)`: modularização de useIndexedDB, useTimer, useAuth, useNotifications, useExport
- `refactor(views)`: split views into smaller Vue components
- `refactor(styles)`: modularização css, tailwind v4 classes, glassmorphism improvements
- `fix(router)`: guards & router usage corrected
- `fix(db)`: toCloneable util for indexedDB

---

## Notas para QA
- Rodar quais testes já existem na pipeline (unit + E2E se aplicável)
- Testar em navegadores populares e em mobile (iOS/Android) para PWA
- Confirmar que não há regressões visuais: foco por teclado, contraste e leituras por leitores de tela

---

## Referências Rápidas — Comandos Úteis
```
# Instalar dependências
npm install

# Development server
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

---

## Observações Finais
- Se desejar, eu posso gerar um arquivo `CHANGELOG.md` detalhado com PRs e commits do repo.
- Também posso criar um script de verificação que valida as classes Tailwind e faz substituições automáticas se desejado (padrões que utilizamos aqui: `bg-linear-to-*`, tokens para min/max widths/heights e toggle util classes).

---

**Versão:** 2.0 — CronoFocus 05/12/2025

**Autor:** Equipe CronoFocus — atualizações manuais e automações

---

## Detailed Technical Reference (legacy CRONOFOCUS)

This section consolidates the more detailed, legacy information from the previous `CRONOFOCUS.md` for developers and QA.

### Build & Metrics
- Bundle final: ~532 KB
- Módulos transformados: 133
- Build time: ~3.06s

### Modularization - Views (FASE 2)
Breakdown (before → after / components created):
- HomeView: 335 → 175 (-48%) — HomeHeader, QuickActions, InProgressBanner, CategoriesLegend
- ExecuteView: 559 → 260 (-53%) — TimerDisplay, TimerControls, SessionStats, DistractionModal, CompletionModal
- PlanView: 339 → 160 (-53%) — WeekNavigation, DayCard, PlanningTips
- SettingsView: 614 → 202 (-67%) — ProfileTab, PreferencesTab, NotificationsTab, DataTab
- HistoryView: 450 → 148 (-67%) — MonthNavigation, MonthStats, HistoryList, CalendarView
- LoginView: 438 → 152 (-65%) — ProfileSelector, LoginForm, RegisterForm
- ReviewView: 366 → 127 (-65%) — StatsOverview, WeeklyChart, CategoryBreakdown, InsightsList
- ExportView: 358 → 163 (-54%) — FormatSelector, DateRangeSelector, ExportPreview

### Modularization - Composables (FASE 3)
Summary (before → after / modules):
- useIndexedDB: 751 → 100 — schema.js, utils.js, core.js, crud.js, entities.js, stats.js
- useAuth: 410 → 80 — crypto.js, session.js, profiles.js
- useNotifications: 420 → 72 — audio.js, push.js, tasks.js, scheduler.js
- useExport: 399 → 35 — utils.js, csv.js, json.js, png.js, report.js
- useTimer: 386 → 80 — worker.js, state.js, controls.js, formatting.js

### Bugs Encontrados e Corrigidos (detalhe)
1. Sons de notificação em `useNotifications` - fallback com `AudioContext` e beep programmatic fixes.
2. Router navigation errors (router.push in templates) - moved calls to methods like `goToX()`.
3. `Symbol(router)` error in guards - dynamic import of `authStore` in `router/index.js` guard.
4. IndexedDB clone errors - `toCloneable()` ensures Vue proxies are stripped before saving.

### Testes Realizados (Smoke & Integration)
- IndexedDB initialization — OK
- Production build — OK (bundle sizes: ~532KB gzipped)
- Lazy loading of views — OK
- Service Worker creation/precache — OK
- Navigation between pages — OK (no console errors)
- Quick Actions — OK
- Router guards (dynamic import) — OK
- Unit/Integration coverage — pending expansion (Vitest)

---

If you want to keep an archival copy of the legacy `CRONOFOCUS.md` rather than delete it, I can rename it to `CRONOFOCUS.legacy.md` and keep it in the repository for reference. Otherwise I'll remove the legacy file after this update.

