# ADR 0004 — Custo mínimo e ambientes isolados

- Data: 01/10/2026
- Status: Proposta que concilia a preferência mais recente com as condições de uso
- Responsável pelo aceite: Pedro; responsável técnica nas decisões de domínio.

## Contexto

O usuário prefere versões gratuitas. A arquitetura anterior pressupunha planos pagos para produção.

## Decisão

Priorizar protótipo local e tiers gratuitos elegíveis. Vercel continua como alvo; a adequação do plano ao uso profissional é um gate. Sem contratação automática. Local usa Supabase local; preview usa dados fictícios isolados; produção entra após aceite. R2 é destino planejado de backup, não serviço já provisionado.

## Alternativas consideradas

Assumir Hobby elegível apenas por haver poucos usuários ignora a restrição de uso pessoal não comercial. Migrar de provedor agora alteraria a stack sem uma decisão informada.

## Consequências

Custo zero permanente não é garantido. Registrar orçamento, limites e recuperação antes do piloto. Se necessário, decidir entre plano compatível e alternativa em novo ADR.

## Validação e acompanhamento

OPS-01 confirma uso permitido; OPS-02 demonstra restauração. Ver operations/deployment.md.

## Revisão futura

Registrar novo ADR quando houver mudança material. Preservar este registro e indicar o sucessor, sem apagar o histórico.
