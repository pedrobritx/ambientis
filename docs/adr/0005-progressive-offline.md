# ADR 0005 — PWA e offline progressivo

- Data: 01/10/2026
- Status: Direção recuperada; escopo proposto
- Responsável pelo aceite: Pedro; responsável técnica nas decisões de domínio.

## Contexto

Vistorias podem ocorrer sem rede e precisam informar o que realmente foi salvo.

## Decisão

Entregar captura online antes de offline. IndexedDB guarda fila limitada de rascunhos autorizados, com idempotência e controle de versão. Revalidar identidade e escopo no servidor ao sincronizar. Aprovação e protocolo exigem conexão. Service Worker não armazena indiscriminadamente respostas privadas.

## Alternativas consideradas

Sincronizar todo o banco aumenta exposição e complexidade. Last-write-wins silencioso pode perder registros técnicos.

## Consequências

Armazenamento do navegador pode ser removido ou atingir quota; não prometer durabilidade absoluta. Exibir fila, erro e conflito; definir recuperação e retenção antes de dados reais.

## Validação e acompanhamento

FIELD-01/OFF-01 testam aparelho real, fechamento, perda de rede, revogação e troca de conta.

## Revisão futura

Registrar novo ADR quando houver mudança material. Preservar este registro e indicar o sucessor, sem apagar o histórico.
