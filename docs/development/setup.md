# Preparação do desenvolvimento

## Situação atual

A local synthetic review slice now runs with Node 24.21.0 and npm 11.19.0. `npm ci` installs the pinned lockfile; `npm run dev -- --port 3411` serves the app on 127.0.0.1. No secrets or cloud services are needed. Install Chromium with `npx playwright install chromium` before `npm run test:e2e`. Build with `NEXT_TELEMETRY_DISABLED=1 npm run build`; use `npm run start -- --port 3411` to serve a completed production build.

The npm commands below are executable. Supabase commands remain future work: no CLI configuration, database or policy tests are present. Docker's daemon was unavailable during the review work. The initialisation list is the remaining operational plan, not a prerequisite for reviewing the local app. See [local evidence](local-review.md) and [ADR 0008](../adr/0008-local-review-slice.md).

## Inicialização em APP-01

1. Criar branch vinculada à issue #4; preservar README e docs.
2. Selecionar versão estável do Next.js e Node LTS compatível. Registrar versões em package.json, lockfile e arquivo de versão do runtime.
3. Usar TypeScript strict, App Router e src/. Adotar npm inicialmente para reduzir ferramentas; manter um único package-lock.json.
4. Adicionar Tailwind e primitivas Radix apenas conforme os componentes surgirem. Adicionar React Hook Form/Zod para formulários concretos.
5. Instalar/configurar Supabase CLI de desenvolvimento e runtime de contêineres local; inicializar config versionada.
6. Criar .env.example com nomes e valores fictícios; preencher .env.local apenas na máquina.
7. Criar scripts abaixo, testes mínimos significativos e workflow CI.
8. Validar do zero em clone limpo e registrar comandos/resultados no PR.

## Contrato de comandos

| Comando previsto | Resultado esperado |
|---|---|
| npm ci | Dependências exatamente do lockfile |
| npm run dev | Aplicação local |
| npm run lint | Verificação estática |
| npm run typecheck | Tipos sem emissão |
| npm test | Testes unitários |
| npm run test:e2e | Jornadas Playwright |
| npm run build | Build de produção |
| supabase start | Serviços locais |
| supabase test db | Testes de banco/políticas locais |

Recriar banco de teste somente em ambiente local descartável e explicitamente identificado. Nunca usar reset em banco remoto ou dados não descartáveis.

## Configuração por ambiente

- Browser: URL Supabase e chave publicável, protegidas por RLS.
- Server: segredos administrativos somente se houver caso de uso aprovado.
- Produção: valores no gerenciador de ambiente do Vercel; nenhum segredo no Git.
- Preview: dados fictícios isolados ou modo demonstrativo, sem credenciais de produção.
- Dev: Supabase local; gerar tipos e versioná-los após migrations.

Nomes de variáveis e método SSR devem seguir os SDKs fixados em APP-01. Não copiar snippets legados sem conferir compatibilidade.

## CI planejada

PRs executam instalação reproduzível, lint, typecheck, testes unitários e build. Adicionar banco/RLS quando DB-01 existir e E2E quando houver jornada. Configurar permissões mínimas; PR de fork não recebe segredos. Migrations de produção ficam fora do CI de pull request.

Não ativar checks obrigatórios de workflows que ainda não existem.

## Connected foundation

The local demonstration still runs without provider settings. The separate `/conexao` screen uses the ignored environment settings described in [connected-workspace.md](connected-workspace.md). No service-role key is required.
