# Qualidade e evidências de entrega

## Matriz de verificação

| Área | Falha concreta | Verificação |
|---|---|---|
| Tenant | Usuário consulta unidade de outra organização | Teste API/SQL com dois tenants e IDs conhecidos |
| Papéis | Analista promove acesso ou aprova QA | Operação direta é negada pelo backend |
| MFA | Sessão AAL1 conclui ação crítica | Negação AAL1 e sucesso autorizado AAL2 |
| Relações | Processo A aponta para documento B | Constraint/política impede referência cruzada |
| Cálculo | Conversão ou arredondamento altera declaração | Testes de limites, nulos, zero e unidades |
| Acervo | Nova versão substitui original | Versões distintas com hashes verificáveis |
| Concorrência | Duas edições perdem dados | Conflito de versão apresentado à usuária |
| Offline | Retentativa duplica registro | Mesma chave idempotente produz um só resultado |
| Revogação | Conta removida envia fila pendente | Servidor nega; dispositivo mostra pendência segura |
| QA | Elaborador aprova sua própria revisão independente | QA-F permanece bloqueado |
| Dossiê | Exportação usa arquivo novo sem revisão | Snapshot conserva versão aprovada |
| Recuperação | Backup restaura só metadados | Restauração verifica banco, objetos e manifest |
| UX | Erro invisível ou foco perdido | Teclado, leitor de tela, zoom e teste móvel |

## Definition of Ready

Issue tem problema, critérios verificáveis, dependências, fase e dados sintéticos de exemplo. Decisões ambientais ambíguas estão registradas para revisão profissional. Dependência crítica resolvida antes de iniciar implementação.

## Definition of Done

- Critérios da issue verificados e evidência anexada ao PR.
- Checks relevantes passam; falhas/limitações não são ocultadas.
- Segurança e acessibilidade avaliadas conforme área alterada.
- Documentação e migrations acompanham comportamento.
- Revisão/aceite concluídos; merge registrado e issue fechada no momento correto.
- Deploy, quando aplicável, verificado sem comprometer dados.
- Project atualizado; funcionalidades previstas não contam como implementadas.

Começar pelos testes mais específicos; ampliar quando o risco exigir. Não exigir porcentagem arbitrária de cobertura. Para PR documental: links locais, coerência dos IDs, dependências, ausência de dados privados e diff são as verificações relevantes.

## Revisão ambiental

Regras, formulários, limites e fontes precisam ser verificados pela responsável técnica na implementação e antes da submissão. O plano de trabalho de origem informa requisitos do produto; não constitui validação jurídica/regulatória atual.
