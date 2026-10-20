# UX — Meridian Forest and workflow journeys

## Current review journey — 2026-10-19

Forest now guides the local review UI: original Grass/Start visual authority, Dawn/Dusk semantic palette, organic controls, editorial primary heading, opaque evidence surfaces and restrained depth. [ADR 0008](../adr/0008-local-review-slice.md) records the deliberate adoption; shared Meridian sources are unchanged.

The home screen offers continue work, attention, jobs and updates. Attention links open the named requirement. Desktop uses a sidebar; mobile uses bottom navigation and a profile action in the utility bar. Job setup asks company/unit, actual activity, location, reporting period, service and water applicability. Unsupported combinations stay explicit and start without automatic requirements.

Technical users can amend scope with reasons, request evidence, review responses and record internal concerns. Clients respond to requests and view released versions in a limited simulated view. Submission and review remain separate. Delivery assembles selected accepted evidence in a fixed numbered version, exports PDF/XLSX/ZIP and records simulated client receipt. Email and signing are not active.

Native dialog supports Escape and focus restoration. Storage errors and damaged local drafts remain visible and do not overwrite saved content. The operational login/MFA, offline queue, resumable cloud uploads and account recovery states below are still future work. [Verification and remaining human checks](../development/local-review.md).

The [identity and interaction refinement](brand-and-interactions.md) records the logo proposal, all ten browser comments, consistent interactive states, reduced-motion fallbacks, rounded keyboard selectors, file/gallery/camera controls and multiple company contacts.

## Decisões recuperadas

Interface mobile-first, navegação guiada, continuidade do trabalho e progresso associado à qualidade. Navegação móvel: **Início, Trabalho, captura (+), Acervo e Mais**. Em telas maiores, navegação lateral com espaço para pendências, ajuda e configurações.

Os tokens exatos de cor, tipografia, ícones e materiais não estavam disponíveis integralmente no histórico consultado. A issue UX-01 deve recuperar a referência ou submeter uma proposta explícita. Não declarar novos tokens como previamente aprovados.

## Mapa de telas

| Área              | Telas e ação principal                                   | Estado de falha / recuperação                                                  |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Acesso            | Login, recuperação, MFA e primeiro acesso                | Sessão expirada preserva rascunho seguro; erro sem revelar existência de conta |
| Início            | Próximas ações, prazos e continuar trabalho              | Vazio oferece criar unidade; falha oferece tentar novamente                    |
| Trabalho          | Empresas → unidades → processos por exercício            | Sem permissão explica como pedir acesso; arquivados permanecem consultáveis    |
| Unidade           | Atividades, cadastros, licenças e condicionantes         | Data ausente aparece pendente, nunca vigente por omissão                       |
| Processo          | Resumo, etapas, requisitos, pendências e responsáveis    | Etapa bloqueada lista motivo e ação para resolver                              |
| Captura           | Foto, documento, resíduo, ponto hídrico, medição, nota   | Câmera/GPS negados permitem arquivo/entrada manual                             |
| Acervo            | Busca, filtros, documento, versões e relações            | Upload interrompido mostra progresso e retomada                                |
| Resíduos          | Correntes, movimentos, estoque e reconciliação           | Divergência mantém valores originais e pede justificativa                      |
| RAPP              | Dataset, fonte, memória e revisão                        | Informação insuficiente pede complemento                                       |
| Recursos hídricos | Ponto, coordenadas, medições, cálculo e análise conjunta | Regra não validada mostra requer revisão                                       |
| QA                | Checklist, evidências, devolução e aprovação             | Sem revisor distinto, aguarda revisão                                          |
| Dossiê            | Índice, prévia, versões, exportação e manifest           | Exportação incompleta não recebe selo de concluída                             |
| Protocolo         | Órgão, número, data, comprovante e recibo                | Sem recibo, manter pendência pós-protocolo                                     |
| Mais              | Perfil, preferências, equipe, configurações e ajuda      | Mudança sensível exige reconfirmação e permissão                               |

## Princípios verificáveis

- Hierarquia: uma ação principal por contexto; detalhes técnicos em expansão.
- Progresso: contar critérios cumpridos, pendências e evidências; sem premiar velocidade de declaração.
- PT-BR inicial; textos separados de regras, datas/quantidades localizadas, termos profissionais preservados.
- Formulários com labels, ajuda, erro associado ao campo e resumo acessível.
- Teclado completo, foco visível, retorno de foco após diálogo, contraste e zoom a 200%.
- Cor nunca é o único indicador. Respeitar redução de movimento.
- Manter contexto de organização, unidade e exercício visível nas ações técnicas.
- Salvamento distingue “rascunho neste dispositivo”, “enviando”, “sincronizado”, “conflito” e “falhou”.
- Antes de sair da conta com fila pendente, explicar o risco e oferecer sincronização/recuperação segura. Não apagar silenciosamente rascunhos.

## Jornada de validação

Com dados sintéticos: login → unidade → inventário → captura → evidência → divergência → correção → revisão → dossiê preliminar. Depois: QA independente → dossiê final → protocolo → recibo. Validar em smartphone e desktop com a usuária; registrar obstáculos e PRs de correção.

## Appearance control

The utility bar includes a keyboard-accessible Dawn/Dusk button. It follows system appearance until a manual choice is made, then remembers that browser preference separately from job drafts. It synchronises preference changes across tabs and falls back to an in-session choice if storage is blocked. Colour roles and logo variants follow the selection. Mobile uses an icon-only control with the full accessible label.

## Registry, invitations and preview

The [browser-comment refinement](registry-invitations-preview.md) adds reviewed CNPJ/CEP/municipality suggestions, separate corporate/facility context, multi-select services and catalogue requirements, a stable mobile navigation surface, local guest onboarding/code renewal and fixed-version report/matrix previews without automatic downloads. Real invitation delivery, identity verification and server isolation remain outside this local slice.
