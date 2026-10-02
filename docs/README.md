# Manual de construção do Ambientis

Este manual transforma as decisões iniciais em uma sequência executável. É um plano de implementação, não uma declaração de funcionalidades prontas.

## Ordem de leitura

| Documento | Pergunta que responde |
|---|---|
| [Visão](product/vision.md) | Para quem construímos e qual é a primeira entrega útil? |
| [UX e jornadas](product/ux.md) | Como a usuária percorre o trabalho e resolve falhas? |
| [Arquitetura](architecture/overview.md) | Onde cada responsabilidade vive? |
| [Dados e integridade](architecture/data-model.md) | Como os registros se relacionam e ficam seguros? |
| [ADRs](adr/README.md) | O que já foi decidido e o que ainda é proposta? |
| [Roadmap](planning/roadmap.md) | Em que ordem implementar e como encerrar cada fase? |
| [Backlog](planning/backlog.md) | Quais issues entregam cada fase? |
| [GitHub Project](planning/github-project.md) | Como visualizar e acompanhar o trabalho? |
| [Desenvolvimento](development/setup.md) | Como preparar o app quando começar a implementação? |
| [Verificação](development/quality.md) | Que evidências são necessárias antes do merge? |
| [Operação](operations/deployment.md) | Como implantar, restaurar e manter custos controlados? |
| [Fontes e decisões pendentes](references.md) | De onde vieram as decisões e quais lacunas restam? |

## Sequência de construção

1. **M0 — Fundação:** revisar visão e ADRs; verificar planos e conexão GitHub–Vercel; configurar Project.
2. **M1 — Base executável:** criar Next.js, pipeline e Supabase local; implementar sessão, MFA, organizações e RLS; estabelecer componentes acessíveis.
3. **M2 — Cadastros e evidências:** entregar empresa/unidade → processo → requisito → documento versionado.
4. **M3 — Primeiro fluxo vertical:** resíduos → reconciliação → inventário → dossiê preliminar com dados sintéticos.
5. **M4 — Especialidades:** RAPP e recursos hídricos com cálculo determinístico e revisão técnica.
6. **M5 — Campo:** captura online; depois fila offline, retomada e conflitos.
7. **M6 — Fechamento:** revisão independente, snapshots de dossiê, protocolos e recibos.
8. **M7 — Operação:** restauração, segurança, aceite assistido e acompanhamento de custos. Dados reais entram apenas após os gates de liberação.

Cada fase tem critérios no [roadmap](planning/roadmap.md). Não é necessário construir todos os módulos vazios antecipadamente: criar diretórios quando a primeira funcionalidade exigir.

## Receita para implementar uma issue

1. Ler seus critérios, dependências e ADRs; confirmar o estado atual do repositório.
2. Descrever o comportamento observável com um exemplo sintético e o cenário de falha.
3. Se houver dados: preparar migration, constraints, políticas e teste de acesso negado antes da UI.
4. Implementar regra de domínio; conectar o caso de uso; montar a tela e seus estados.
5. Validar unidade, integração e jornada relevantes. Atualizar documentação afetada.
6. Abrir PR pequeno com vínculo à issue e evidência de teste. Ver [CONTRIBUTING](../CONTRIBUTING.md).
7. Após merge e aceite, encerrar a issue e atualizar o Project. Manter pendências abertas.

## Limites de autoridade

Pedro decide produto, custos e arquitetura; a responsável técnica valida conteúdo e critérios ambientais. Revisão de software não substitui revisão profissional do dossiê. Exclusões destrutivas dependem de autorização explícita. Fontes privadas de planejamento não devem ser copiadas para este repositório público.
