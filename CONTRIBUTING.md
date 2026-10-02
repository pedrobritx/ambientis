# Contribuição e estratégia de PRs

## Fluxo

1. Escolher issue pronta, verificar dependências e ler ADRs.
2. Criar branch curta a partir de main atualizado: feat/4-app-foundation, fix/numero-resumo ou docs/numero-resumo.
3. Manter uma entrega coerente por PR. Abrir draft cedo quando necessário.
4. Descrever problema, comportamento resultante, decisões relevantes, testes e riscos. Usar Closes #N apenas quando o merge encerrar todos os critérios.
5. Revisar diff e resultados de CI; pedir revisão humana quando disponível.
6. Fazer merge após aceite. Preferência proposta: squash para manter histórico de entregas.
7. Atualizar issue, Project, documentação e registro de release.

Sem branch develop permanente nesta fase. Hotfix também passa por PR e validação proporcional. Não fazer force-push, apagar branches ou remover arquivos sem autorização explícita do proprietário.

## Registros

- Issue: problema, critérios, dependências e aceite.
- PR: implementação, diff e resultados de verificação.
- ADR: decisão arquitetural relevante, alternativas e consequências.
- Milestone: critério de entrega de uma fase.
- Project: estado operacional, prioridade e planejamento.
- Release: versão, mudanças entregues, migrations e observações de operação.

Evitar duplicar status em muitos documentos: issues/Project são o estado vivo; roadmap define sequência e gates. Atualizar docs quando a arquitetura/escopo mudar.

## Proteção de main — configuração pendente

Recomendar PR obrigatório, resolução de conversas, bloqueio de force-push e exclusão, e checks que já existam. Com um único desenvolvedor, não exigir aprovação de outro autor até haver revisor habilitado; isso evitaria bloquear todo merge. Revisão técnica ambiental independente continua obrigatória para QA-F do produto.

Ativar regras em GOV-02 após inspecionar configuração e compatibilidade do plano. Não alterar métodos de merge, excluir branches automaticamente ou tornar repositório privado neste PR.

## Segurança e conteúdo

Usar apenas exemplos sintéticos. Não anexar documentos reais de clientes, credenciais, dados pessoais, preços de propostas privadas ou URLs com tokens. Para vulnerabilidade, usar canal privado acordado com o mantenedor; não abrir issue pública com exploração e dados sensíveis.

## Validação

Consultar [matriz de qualidade](docs/development/quality.md). Relatar exatamente o que foi executado. Se algo depende de dispositivo, ambiente ou serviço indisponível, registrar como pendente.
