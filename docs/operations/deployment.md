# Implantação, custos e operação

## Objetivo de custo

Começar com o menor custo sustentável e serviços gratuitos quando o uso for permitido. Não há contratação ou upgrade autorizado por este documento.

A Vercel limita Hobby a uso pessoal não comercial. Poucos usuários, uso interno ou ausência de cobrança pelo app não bastam para presumir elegibilidade de um fluxo profissional. OPS-01 deve confirmar o enquadramento antes da operação. Fonte: [Vercel Hobby](https://vercel.com/docs/plans/hobby), consultada em 01/10/2026.

Supabase Free pode apoiar protótipo dentro de seus limites. Confirmar capacidade, pausa por inatividade, backup e recuperação antes de usar dados reais; gratuidade não equivale a backup operacional. Fonte: [planos Supabase](https://supabase.com/pricing).

## Ambientes

- Local: Supabase local, dados sintéticos, migrations e testes.
- Preview: layout e jornadas com dados sintéticos isolados. Sem acesso ao banco/Storage de produção.
- Produção: somente depois do aceite M7; credenciais e buckets próprios, acesso mínimo.
- Staging cloud: adicionar quando houver necessidade e orçamento. Não criar por hábito.

## Integração Vercel alvo

Repositório pedrobritx/ambientis; branch de produção main; raiz do app na raiz do repositório; preset Next.js; comandos conforme package.json e lockfile implementados em APP-01.

O projeto já existe, mas vínculo Git, plano, preset, domínio e variáveis não foram confirmados: a consulta detalhada falhou. Não alterar configurações com base em suposição. Não criar deployment documental como se fosse o aplicativo.

## Sequência de release

1. Checks e critérios da issue passam; revisar alterações em dados e escopo.
2. Preparar migration compatível com versão atual e nova do app; testar localmente.
3. Antes de mudança relevante em dados: confirmar backup e capacidade de restaurar.
4. Aplicar migration por procedimento controlado, registrado e separado de PRs não confiáveis.
5. Implantar app compatível; verificar login, isolamento, escrita, upload e exportação conforme escopo.
6. Registrar versão/commit, migration, deployment, responsável e resultado.
7. Se app falhar, reverter deployment compatível. Não presumir que rollback de app desfaz schema ou dados.

## Backup e restauração

Planejado: backup independente do PostgreSQL, objetos privados e manifests, com credenciais separadas. Cloudflare R2 é o destino arquitetural previsto, ainda não configurado.

Antes de operação: definir e aceitar perda máxima de dados (RPO) e tempo de recuperação (RTO); selecionar frequência e retenção; criptografar cópias; monitorar falhas; restaurar em ambiente isolado e comparar hashes. Backup do banco não substitui backup dos arquivos.

Nenhuma rotina de retenção deve excluir dados sem política e autorização explícitas.

## Observabilidade e manutenção

Logs estruturados com request_id, operação, código de erro e identificadores mínimos. Não registrar payloads técnicos, tokens ou conteúdo de documentos. Evitar dependência de serviço extra de observabilidade até necessidade concreta.

Rotina: acompanhar falhas de sincronização/upload, sucesso de exportação, espaço ocupado, consumo de banco/egress e backup. Revisar mensalmente custos e dependências; revisar regras ambientais antes de novas declarações e quando normas mudarem.

## Checklist de produção

- Plano permite o uso, custos e limites aceitos.
- RLS, papéis, MFA, Storage e revogação verificados.
- Previews isolados; HTTPS, URLs de auth e segredos corretos.
- Backup restaurado com sucesso; responsáveis por incidente definidos.
- QA independente e conteúdo técnico validados.
- Acessibilidade e uso em dispositivos reais verificados.
- Sem dados reais em repositório público, CI ou screenshots.
- Manual de operação e limitações disponíveis à usuária.

Pendências são rastreadas em OPS-01, OPS-02, SEC-01 e PILOT-01.
