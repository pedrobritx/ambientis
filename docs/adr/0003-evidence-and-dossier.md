# ADR 0003 — Evidências, versões e dossiê lógico

- Data: 01/10/2026
- Status: Direção recuperada; detalhamento proposto
- Responsável pelo aceite: Pedro; responsável técnica nas decisões de domínio.

## Contexto

O dossiê precisa comprovar a origem dos dados e preservar o material efetivamente revisado.

## Decisão

Arquivos privados e versionados, hash SHA-256, nome original e relações tipadas. Dossiê lógico com índice, manifest, relatório e arquivos associados; PDF consolidado é evolução. Exportação fixa versões por snapshot.

## Alternativas consideradas

Um PDF único sem manifest perde relações e dificulta verificação. Sobrescrever arquivo técnico elimina histórico.

## Consequências

Maior uso de armazenamento e necessidade de retenção. Hash comprova integridade do conteúdo comparado, não autoria ou assinatura legal. Upload exige tratamento de falha parcial entre banco e Storage.

## Validação e acompanhamento

DOC-01 e DOS-01/DOS-02 verificam versões, manifests e arquivos.

## Revisão futura

Registrar novo ADR quando houver mudança material. Preservar este registro e indicar o sucessor, sem apagar o histórico.
