# Proveniência e decisões pendentes

## Fontes de produto

- Conversa “Proposta De Web App Ambiental”, fornecida por Pedro: decisões de stack, esboço de banco e wireframes. ID de referência: 6abf065a-8b98-83e9-8763-b5fea7de284b.
- Plano de Trabalho para Responsabilidade Técnica Ambiental: fonte privada consultada para Base Mestra, cadeia de evidências, campos e gates QA-A a QA-G.
- Proposta técnico-comercial: referência privada de contexto, sem reprodução de dados comerciais.

Essas fontes permanecem privadas e não foram copiadas para o GitHub. O leitor público não precisa acessá-las para seguir este manual. O histórico recuperado é limitado: os textos longos de arquitetura, banco e wireframe vieram truncados em 20.000 caracteres. Não afirmar cobertura integral de decisões anteriores.

## O que foi preservado

Next.js/TypeScript, Supabase/PostgreSQL, Vercel, PWA e destino R2; monólito modular, ausência de ORM inicial, banco como fonte de verdade, arquivos privados, organizações e acesso por escopo, MFA em ações críticas, documentos versionados, auditoria, regras ambientais separadas da UI e core independente de IA. Meridian Terra e navegação mobile-first foram preservados no nível funcional recuperável.

## O que esta entrega propõe

Arquitetura concreta de pastas, ordem M0–M7, 23 issues com critérios, fluxos de PR e oito views. São propostas de implementação para revisão no PR de fundação; não são funcionalidades já construídas.

A preferência mais recente por minimizar custos substitui a suposição anterior de planos pagos obrigatórios desde o início. Isso não altera as condições de uso dos provedores.

## Decisões abertas

1. Elegibilidade e orçamento de produção Vercel/Supabase; sem upgrade automático.
2. Tokens exatos Meridian Terra e imagens aprovadas não recuperadas.
3. Revisor independente para QA-F e disponibilidade no piloto.
4. Política de retenção, RPO/RTO e dados permitidos no dispositivo.
5. Volumetria de arquivos e arquitetura da exportação após benchmark.
6. Versões de dependências, região efetiva dos serviços e domínio.
7. Enquadramentos, normas, campos e cálculos a validar pela responsável técnica.
8. Configuração existente do Project #12 e vínculo Git do Vercel.

## Fontes técnicas consultadas

- [Next.js — Project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel — Hobby](https://vercel.com/docs/plans/hobby)
- [Supabase — Pricing](https://supabase.com/pricing)
- [GitHub — Board layout](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout)

Consultadas em 01/10/2026. Confirmar versões, planos e documentação ao implementar; nenhum preço fixo foi tratado como compromisso.
