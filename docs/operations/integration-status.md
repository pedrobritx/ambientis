# Estado das integrações

Linha de base: 01/10/2026, horário de São Paulo. Este registro não substitui verificação ao retomar o trabalho.

| Integração            | Verificado                                                                                      | Pendente / limitação                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| GitHub repository     | pedrobritx/ambientis público, branch padrão main; vazio no início; acesso de escrita confirmado | Proteções, labels e métodos de merge não foram alterados                                     |
| Código e documentação | README inicial em main; branch docs/ambientis-foundation para revisão do manual                 | Merge do PR após revisão                                                                     |
| Issues                | 23 issues #1–#23 criadas com critérios e dependências                                           | Milestone nativo, labels e inclusão no Project                                               |
| GitHub Project #12    | URL fornecida pelo usuário; consulta pública retornou 404                                       | Sem leitura autenticada ou ferramenta Projects; não inferir que está vazio/inexistente       |
| Milestones            | Oito fases definidas em roadmap e manifest                                                      | Não criados nativamente; integração não expõe essa operação                                  |
| Vercel                | Projeto ambientis localizado no time britx-projects; listagem retornou zero deployments         | Plano, vínculo Git, domínio, env, preset e root directory não confirmados                    |
| Vercel detalhes       | Consulta com nome e ID retornou erro de validação idOrName ausente                              | Incompatibilidade de argumentos do conector; não foi possível validar configuração detalhada |
| CLI GitHub            | Ferramenta instalada, sem sessão autenticada                                                    | Não pode administrar Project/milestones nesta sessão                                         |
| Supabase / R2         | Decisões arquiteturais registradas                                                              | Instâncias, regiões, planos e backups não foram criados nem inspecionados                    |

## Local review update — 2026-10-19

A Next.js synthetic review app is implemented locally on `feat/local-review-workflow`. It has no authenticated hosting, identity, storage or messaging provider integration. Explicit read-only public BrasilAPI lookups for CNPJ, CEP and GO/DF municipalities are implemented and were spot-checked on 2026-10-19; returned suggestions require user review. See [registry and local invitation boundaries](../product/registry-invitations-preview.md). Earlier rows above remain a historical snapshot and have not been reverified as current service state. [Local checks and continuation](../development/local-review.md) describe the implemented scope and [operating considerations](initial-operating-considerations.md) record current reference limits. No deployment or service configuration was changed.

## Como concluir a configuração

Issue #2: obter acesso autenticado ao Project e seguir o guia de configuração com inventário prévio. Issue #3: verificar configuração detalhada do Vercel e adequação do plano. Não requer refazer as issues ou duplicar o repositório.

Não foram apagados arquivos, registros, branches ou deployments. Fontes privadas do projeto ChatGPT foram apenas consultadas.

## Connected foundation update — 2026-10-19, São Paulo

- GitHub: origin/main verified at 8899829; no open Ambientis PR at inventory. The existing repository has two Vercel project deployment integrations and GitHub Pages history. The review branch includes a branch-specific automatic deployment exclusion; production behaviour is unchanged. PR/CI evidence is recorded with delivery, not inferred from local tests.
- Supabase: user-selected existing project `ggoobqtnxwzynpmertmn`, region us-west-2, ACTIVE_HEALTHY, PostgreSQL 17.11. Initial inventory contained no application tables, Auth users, buckets or files. Three additive migrations now create 11 application tables with RLS, restricted RPC/grants, audit and covering foreign-key indexes. No service-role credential is used by the app.
- Verification: direct rollback SQL tests passed on the selected service, covering different organizations and clients in one consultancy, private requirements, draft requests, prohibited writes, escalation, composite foreign keys and revocation. Read-back confirmed zero retained Auth users, organizations, audit events and storage objects. Anonymous Data API read returned 401. Security advisor returned no lints after restricting a pre-existing RLS event-trigger helper. Performance advisor only reports unused indexes on the new empty schema; no indexes were removed.
- First account: not created. An administrator must create the first account in Supabase Auth before the real login/create-workspace UI can be exercised. Auth email/provider/signup settings have not been changed. There is no public sign-up form or invitation provisioning in this app slice.
- Figma: the supplied Ambientis file initially had one empty page and no local variables. It now has three added product pages, Forest Dawn/Dusk variables, styles, original SVG icons, button states, desktop/mobile references and editable data/workflow decisions. Existing page and shared Meridian sources were preserved. See design ledger.
- Source context: read the project chat “Plano de Trabalho Ambiental” via the app connector after the public GPT Project required login and the share link exposed no text. The original workflow, separate reporting periods, waste reconciliation and water-resource scope inform the model. Private proposal contents, fees and professional identifiers are not copied into public source files. Environmental applicability remains pending professional review.
- Boundaries: no new deployment, client data, Auth account, live invitation/email, storage bucket or release was provisioned by this slice. Existing local drafts were not imported or reset. Database management authorization came from Pedro's explicit request to create this database/API.
