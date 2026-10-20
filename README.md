# Ambientis

Aplicação para apoiar a responsável técnica ambiental na organização de empresas, unidades, evidências, inventários de resíduos, RAPP, recursos hídricos e dossiês.

**Current state: local review application plus a connected Supabase foundation, using synthetic data.** The dashboard, editable checklist, request/review journey and PDF/XLSX/ZIP dossier exports are implemented for review. The dashboard still uses the local review adapter. A separate `/conexao` screen and `/api/v1` API add real Supabase Auth verification and database-backed directory/work records with RLS. Cloud files, real invitations/email, signature validation and regulatory approval are pending. Do not enter client information.

[Connected workspace setup and API](docs/development/connected-workspace.md) · [Figma design record](docs/design/README.md)

## Run the local review

Use Node 24.21.0 (`.nvmrc`) and npm. Run `npm ci`, then `npm run dev -- --port 3411` and open <http://127.0.0.1:3411>. No environment variables or provider credentials are needed. Changes are stored in this browser only. The perspective selector simulates roles; it is not sign-in.

Run `npm run lint`, `npm run typecheck`, `npm test`, `npx playwright install chromium`, `npm run test:e2e` and `NEXT_TELEMETRY_DISABLED=1 npm run build` to verify the review slice.

[Local review evidence and limitations](docs/development/local-review.md) · [Scope decision](docs/adr/0008-local-review-slice.md) · [Operating considerations](docs/operations/initial-operating-considerations.md)

The local [brand guide](http://127.0.0.1:3411/brand/index.html) includes logos, icons, applications and a portable download. [Identity and interaction refinement](docs/product/brand-and-interactions.md) records the browser-feedback changes and limitations. Companies support multiple fictional contacts; file/photo/camera controls preserve the same small browser-storage limits.

[Registry, invitations and delivery preview](docs/product/registry-invitations-preview.md) records optional public BrasilAPI lookups, multi-select services/requirements, expiring local invitation codes, registration editing and snapshot previews. Guest onboarding remains a same-browser demonstration, not real authentication.

Meridian **Forest** is the current visual guideline for this implementation. Earlier Terra references are historical planning context. The longer-term architecture below remains the operational target.

## Comece aqui

1. [Manual de construção](docs/README.md)
2. [Visão e escopo](docs/product/vision.md)
3. [Arquitetura e pastas](docs/architecture/overview.md)
4. [Decisões arquiteturais — ADRs](docs/adr/README.md)
5. [Roadmap e milestones](docs/planning/roadmap.md)
6. [Backlog com issues reais](docs/planning/backlog.md)
7. [Configuração do GitHub Project](docs/planning/github-project.md)
8. [Como contribuir e abrir PRs](CONTRIBUTING.md)

## Espaços do projeto

- [Repositório](https://github.com/pedrobritx/ambientis)
- [GitHub Project #12](https://github.com/users/pedrobritx/projects/12)
- [Vercel Ambientis](https://vercel.com/britx-projects/ambientis)
- [Estado das integrações e pendências](docs/operations/integration-status.md)

## Direção técnica

Next.js App Router, TypeScript, Supabase/PostgreSQL, autenticação e Storage privados, hospedagem Vercel e PWA progressiva. Monólito modular; dados técnicos permanecem rastreáveis até as evidências e revisões. Gratuidade é um objetivo de custo sujeito às condições de cada serviço.

Este repositório é público. Dados reais, documentos de clientes, credenciais e propostas comerciais devem permanecer em ambientes privados. Exemplos, testes e previews usam dados sintéticos.
