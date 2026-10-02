# Estado das integrações

Linha de base: 01/10/2026, horário de São Paulo. Este registro não substitui verificação ao retomar o trabalho.

| Integração | Verificado | Pendente / limitação |
|---|---|---|
| GitHub repository | pedrobritx/ambientis público, branch padrão main; vazio no início; acesso de escrita confirmado | Proteções, labels e métodos de merge não foram alterados |
| Código e documentação | README inicial em main; branch docs/ambientis-foundation para revisão do manual | Merge do PR após revisão |
| Issues | 23 issues #1–#23 criadas com critérios e dependências | Milestone nativo, labels e inclusão no Project |
| GitHub Project #12 | URL fornecida pelo usuário; consulta pública retornou 404 | Sem leitura autenticada ou ferramenta Projects; não inferir que está vazio/inexistente |
| Milestones | Oito fases definidas em roadmap e manifest | Não criados nativamente; integração não expõe essa operação |
| Vercel | Projeto ambientis localizado no time britx-projects; listagem retornou zero deployments | Plano, vínculo Git, domínio, env, preset e root directory não confirmados |
| Vercel detalhes | Consulta com nome e ID retornou erro de validação idOrName ausente | Incompatibilidade de argumentos do conector; não foi possível validar configuração detalhada |
| CLI GitHub | Ferramenta instalada, sem sessão autenticada | Não pode administrar Project/milestones nesta sessão |
| Supabase / R2 | Decisões arquiteturais registradas | Instâncias, regiões, planos e backups não foram criados nem inspecionados |

## Como concluir a configuração

Issue #2: obter acesso autenticado ao Project e seguir o guia de configuração com inventário prévio. Issue #3: verificar configuração detalhada do Vercel e adequação do plano. Não requer refazer as issues ou duplicar o repositório.

Não foram apagados arquivos, registros, branches ou deployments. Fontes privadas do projeto ChatGPT foram apenas consultadas.
