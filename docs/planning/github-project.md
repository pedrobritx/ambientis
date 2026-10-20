# GitHub Project #12 — configuração e visualizações

Destino: https://github.com/users/pedrobritx/projects/12

**Historical foundation snapshot:** issues criadas, Project não inspecionado por acesso autenticado. Consulta pública retornou 404, o que não prova inexistência. Integração GitHub disponível não expõe Projects, milestones ou configuração de repositório. GitHub CLI local está sem autenticação. Nenhuma view, campo, item, milestone nativo ou regra de proteção foi aplicada por esta entrega.

## Procedimento seguro

1. Abrir o Project existente autenticado como Pedro e inspecionar descrição, campos, views e itens.
2. Preservar tudo que já existir; reaproveitar campos compatíveis. Comparar IDs/URLs antes de adicionar issues.
3. Vincular pedrobritx/ambientis ao projeto. Adicionar as 23 issues do [backlog](backlog.md).
4. Criar milestones M0–M7 no repositório a partir de [roadmap](roadmap.md) e associar issues.
5. Criar apenas campos ausentes e preencher usando [backlog.json](backlog.json).
6. Configurar views e automações abaixo; conferir dois itens de fases diferentes.
7. Atualizar [estado das integrações](../operations/integration-status.md) e anexar evidência à issue #2.

## Descrição curta sugerida

“Construção do Ambientis: Base Mestra Ambiental, evidências, resíduos, RAPP, recursos hídricos e dossiês. Acompanhar decisões, implementação, validação e operação com baixo custo.”

README do Project: apontar para README do repositório, manual, roadmap, ADRs, backlog e critérios de Done. Evitar copiar todo o manual para um segundo local.

## Campos

| Campo | Tipo / valores |
|---|---|
| Status | Seleção: Backlog, Ready, In progress, In review, Blocked, Done |
| Phase | Seleção: M0, M1, M2, M3, M4, M5, M6, M7 |
| Priority | Seleção: P0, P1, P2 |
| Area | Seleção com áreas do backlog.json |
| Target release | Texto; preencher quando houver release definida |
| Start date / Target date | Data; inicialmente vazias |
| Assignees, Milestone, Linked pull requests | Campos nativos quando disponíveis |

Reusar Status já existente com mapeamento documentado; não apagar opções ou itens. Dependências ficam inicialmente nos corpos das issues; usar vínculos nativos quando disponíveis, sem duplicar relações divergentes.

## Visualizações propostas

| Nome | Layout | Filtro / organização | Uso |
|---|---|---|---|
| 01 — Visão geral | Tabela | Repositório Ambientis, agrupar Phase; mostrar Status, Priority e Milestone | Revisão de escopo |
| 02 — Execução | Board | Excluir Done; colunas Status; ordenar Priority | Trabalho diário |
| 03 — Roadmap | Roadmap | Incluir todos; datas Start date / Target date; agrupar Phase se disponível | Calendário após estimativa |
| 04 — Backlog | Tabela | Status Backlog ou Ready; ordenar Priority | Refinamento |
| 05 — Revisão e PRs | Tabela | Status In review; mostrar Linked pull requests e Assignees | Validação antes do merge |
| 06 — Bloqueios | Tabela | Status Blocked | Dependência, decisão ou acesso pendente |
| 07 — Marco atual | Board | Phase igual à fase em execução, inicialmente M0 | Acompanhar gate da fase |
| 08 — Entregues | Tabela | Status Done; mostrar Milestone e PRs | Histórico de entregas |

Configurar filtros pela UI e salvar cada view. Os nomes de campos devem corresponder exatamente aos campos existentes; validar o resultado, não colar filtros sem conferência. Roadmap fica sem barras até datas reais serem preenchidas.

## Automações propostas

- Auto-add: issues/PRs abertos de pedrobritx/ambientis quando suportado.
- Item novo entra em Backlog.
- Issue fechada como concluída → Done; item descartado deve ter motivo visível, sem ser confundido com entrega.
- PR merged → Done para o item PR; issue só encerra quando seus critérios forem cumpridos.
- Issue reaberta → Ready ou Backlog após triagem.
- Sem autoarchive ou exclusão de itens nesta fase.

Mesmo com automação, verificar que PR e issue aparecem vinculados. Não criar um segundo draft item para issue já existente.

## Labels planejadas

Criar/reusar type:feature, type:bug, type:docs, type:decision, type:chore e risk:security / risk:data quando úteis. Phase e Priority permanecem campos do Project para evitar manter dois estados conflitantes.

## Alternativa com GitHub CLI

A execução autenticada precisa de acesso ao repositório e escopo de Projects. Não compartilhar token em chat.

Inventário inicial, somente leitura:

```sh
gh project view 12 --owner pedrobritx --format json
gh project field-list 12 --owner pedrobritx --format json
gh project item-list 12 --owner pedrobritx --limit 100 --format json
gh api --paginate 'repos/pedrobritx/ambientis/milestones?state=all'
```

Depois de comparar itens, adicionar cada URL ausente, por exemplo:

```sh
gh project item-add 12 --owner pedrobritx --url https://github.com/pedrobritx/ambientis/issues/1
```

Repetir somente para URLs ausentes do manifest, inspecionando o resultado. Criar/editar campos e milestones apenas depois do inventário. Este documento não executa importação e o CSV não pressupõe importador nativo.

Referência: [visualizações de board no GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout).

## Verified configuration — 2026-10-20

Authenticated access confirmed that Project #12 links this repository, preserves all 23 original issue items and uses the existing 22 fields. Status remains Todo / In progress / Done; no existing option, view, item or milestone was deleted. Milestones M0–M7 retain empty dates. Example checks: #1 is M0/docs/P0 and #11 is M3/waste/P0; both are Todo pending their actual work. #4/#7 became Done when PR #27 merged.

The three existing views (Monthly roadmap, Quarterly roadmap, Backlog) remain intact. Eight additional views now implement the guide using existing status values:

| View | Saved configuration |
|---|---|
| [01 — Visão geral](https://github.com/users/pedrobritx/projects/12/views/4) | Table, repository filter, Phase groups; Title/Status/Phase/Priority/Milestone/Assignees/Linked PRs |
| [02 — Execução](https://github.com/users/pedrobritx/projects/12/views/5) | Board, exclude Done, Status columns, Priority ascending |
| [03 — Roadmap](https://github.com/users/pedrobritx/projects/12/views/6) | Roadmap, Phase groups, existing Start date / Target date fields; no dates invented |
| [04 — Backlog](https://github.com/users/pedrobritx/projects/12/views/7) | Table, Todo, Priority ascending |
| [05 — Revisão e PRs](https://github.com/users/pedrobritx/projects/12/views/8) | Table, open PRs, Linked PRs and Assignees visible; avoids adding an unnecessary review status |
| [06 — Bloqueios](https://github.com/users/pedrobritx/projects/12/views/9) | Table, `blocked` label; #1/#3 await explicit professional/operating decisions |
| [07 — Marco atual](https://github.com/users/pedrobritx/projects/12/views/10) | Board, Phase M0, Status columns |
| [08 — Entregues](https://github.com/users/pedrobritx/projects/12/views/11) | Table, Done, Milestone and Linked PRs visible |

Native workflow settings were inspected in the authenticated UI: new items → Todo, closed items → Done, merged PRs → Done; auto-add targets `ambientis` with `is:issue,pr is:open`. Reopened issues/PRs now return to Todo. Eight workflows are enabled, including the existing linked-PR and auto-close rules. Auto-archive is not enabled. Never set Done on incomplete issues: the existing auto-close workflow can close them.

Main protection is active and read back: PRs required, strict `local-review` and `database-api` checks from GitHub Actions (app 15368), resolved conversations, administrator enforcement, no force-push/deletion and zero mandatory outside approvals for the single-contributor workflow. Only checks that have actually passed were made required. No merge-method, automatic branch-deletion or repository-visibility setting was changed.

This live record supersedes the historical access limitation above. It does not approve environmental rules, cost eligibility, recovery readiness or operational release.
