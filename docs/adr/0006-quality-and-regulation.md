# ADR 0006 — Regras determinísticas e revisão independente

- Data: 01/10/2026
- Status: Direção recuperada; detalhamento proposto
- Responsável pelo aceite: Pedro; responsável técnica nas decisões de domínio.

## Contexto

Declarações precisam de fonte, cálculo e julgamento técnico; a primeira usuária pode trabalhar sozinha.

## Decisão

Separar regras ambientais da UI, versionar jurisdição/vigência/fonte e guardar a versão aplicada. Ausência de dados ou regra validada exige revisão. QA-F requer pessoa distinta do elaborador. Usuária solo prepara tudo, mas o estado permanece aguardando revisão até participação independente.

## Alternativas consideradas

IA não é adequada como fonte única de cálculo ou aprovação. Duplicar contas da mesma pessoa não produz revisão independente.

## Consequências

Exige disponibilidade de revisor e validação das normas. Aprovações não se mantêm automaticamente após alteração dos dados; nova revisão é necessária.

## Validação e acompanhamento

QA-01, RAPP-01 e WATER-01 validam regras e identidade do revisor. IA futura permanece auxiliar.

## Revisão futura

Registrar novo ADR quando houver mudança material. Preservar este registro e indicar o sucessor, sem apagar o histórico.
