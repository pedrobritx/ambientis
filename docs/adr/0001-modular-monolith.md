# ADR 0001 — Monólito modular e stack web

- Data: 01/10/2026
- Status: Direção recuperada; detalhamento proposto
- Responsável pelo aceite: Pedro; responsável técnica nas decisões de domínio.

## Contexto

Poucos usuários e manutenção enxuta, com dados relacionais e fluxos técnicos integrados.

## Decisão

Usar Next.js App Router/React/TypeScript e Supabase; módulos por capacidade dentro de um app. Tailwind, Radix, React Hook Form e Zod apoiam UI e formulários. A árvore de pastas está em architecture/overview.md.

## Alternativas consideradas

Backend separado e microserviços aumentariam operação e duplicação; plataformas puramente documentais dificultariam integridade relacional.

## Consequências

Um ciclo de implantação e menor infraestrutura. Exige fronteiras internas claras, testes de domínio e atenção aos limites serverless. Reavaliar separação apenas diante de volumetria ou requisitos concretos.

## Validação e acompanhamento

APP-01 fixa versões e build; UX-01 valida componentes.

## Revisão futura

Registrar novo ADR quando houver mudança material. Preservar este registro e indicar o sucessor, sem apagar o histórico.
