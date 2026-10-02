# ADR 0007 — Issues, PRs e registro de decisões

- Data: 01/10/2026
- Status: Proposta
- Responsável pelo aceite: Pedro; responsável técnica nas decisões de domínio.

## Contexto

O repositório começou vazio e precisa de um processo rastreável sem burocracia desnecessária.

## Decisão

main e branches curtas, issue para cada entrega, PR focado, ADR para decisão estrutural, milestones por gate e Project para estado vivo. Preferir squash após aceite. Configuração de proteção fica em GOV-02 e depende de checks existentes.

## Alternativas consideradas

GitFlow completo e múltiplas branches permanentes adicionariam coordenação para uma equipe pequena. Registro apenas em chat perde ligação com código.

## Consequências

Um desenvolvedor não pode aprovar seu próprio PR como segundo revisor GitHub; não exigir aprovação impossível. Isso não altera o QA ambiental independente. Nenhuma exclusão de branch automática.

## Validação e acompanhamento

GOV-01/GOV-02 e CONTRIBUTING.md orientam configuração e validação.

## Revisão futura

Registrar novo ADR quando houver mudança material. Preservar este registro e indicar o sucessor, sem apagar o histórico.
