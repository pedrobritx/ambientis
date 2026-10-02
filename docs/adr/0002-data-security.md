# ADR 0002 — PostgreSQL, RLS e SQL versionado

- Data: 01/10/2026
- Status: Direção recuperada; contratos propostos
- Responsável pelo aceite: Pedro; responsável técnica nas decisões de domínio.

## Contexto

Dados de organizações e unidades não podem depender de filtros da interface para proteção.

## Decisão

Supabase JS, tipos gerados e migrations SQL, sem ORM inicial. Aplicar constraints, RLS e grants mínimos. Autorizar por membership ativo, papel e unidade. Ações críticas usam transação, identidade verificada e MFA quando aplicável.

## Alternativas consideradas

Autorização somente no frontend permite acesso direto indevido. ORM não elimina policies e adicionaria outra representação do schema nesta fase.

## Consequências

Políticas precisam de testes diretos e verificação de referências cruzadas. service-role fica restrita a operações administrativas, nunca ao CRUD padrão.

## Validação e acompanhamento

DB-01 testa duas organizações, revogação, escopos e escalada de papéis.

## Revisão futura

Registrar novo ADR quando houver mudança material. Preservar este registro e indicar o sucessor, sem apagar o histórico.
