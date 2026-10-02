# Modelo de dados e contratos de integridade

Modelo lógico para orientar migrations. Não é DDL executado nem cópia integral do esboço anterior, cuja recuperação ficou truncada. Validar cada tabela ao implementar sua issue.

## Núcleo e expansão

| Grupo / fase | Entidades previstas | Relações e finalidade |
|---|---|---|
| Identidade / M1 | profiles, organizations, organization_members, facility_access | profile referencia auth.users; associação controla papel e acesso |
| Base / M2 | companies, facilities, facility_activities, environmental_registrations, licenses, license_conditions | organização → empresa → unidade; dados permanentes |
| Trabalho / M2 | projects, processes, process_steps, tasks, requirements | projeto agrupa trabalhos; processo liga unidade, tipo e exercício |
| Acervo / M2 | documents, document_versions, evidence_links | arquivo lógico, versões e vínculo tipado a requisito/objeto |
| Governança / M2 | audit_events, process_revisions | eventos append-only para usuários; revisão registra mudanças técnicas |
| Resíduos / M3 | waste_streams, waste_movements, waste_stocks, movement_documents, reconciliations | relações documentais podem ser muitos-para-muitos |
| RAPP / M4 | rapp_datasets, rapp_entries, calculation_records | quantidade, unidade, exercício, fonte e fórmula versionada |
| Água / M4 | water_points, water_measurements, water_assessments, regulatory_rule_versions | medições e avaliação individual/conjunta |
| Campo / M5 | inspections, field_records, sync_operations | registros e chaves idempotentes |
| Fechamento / M6 | qa_reviews, dossier_versions, dossier_items, submissions, receipts | revisão independente, snapshot, envio externo e prova de recebimento |

Criar projects apenas quando o agrupamento trouxer valor; a primeira jornada pode usar processos diretamente associados à unidade. Manter o conceito previsto, sem camada vazia obrigatória.

## Invariantes obrigatórias

- IDs UUID; datas técnicas date e timestamps de eventos timestamptz. Exibir fuso local sem perder instante original.
- organization_id obrigatório em entidades de negócio. Relações compostas, por exemplo (organization_id, facility_id), devem referenciar entidade do mesmo tenant.
- Unicidade de membership por organização/usuário e CNPJ normalizado por organização. CNPJ é texto; a regra de formato deve acompanhar a especificação vigente, sem converter para número.
- Quantidades em numeric/decimal, com unidade, precisão e origem explícitas; proibir soma de unidades incompatíveis. Nulo significa desconhecido e difere de zero.
- Exercício-base separado do ano de entrega; nenhuma regra depende do relógio corrente para reinterpretar um processo histórico.
- Colunas created_at/by, updated_at/by, archived_at e version nos registros editáveis relevantes; autoria e horário vêm de contexto confiável.
- Escrita concorrente compara version. Conflito devolve conteúdo atual e opções de resolução, sem sobrescrever silenciosamente.
- Exclusão técnica comum arquiva. Purga é procedimento futuro com retenção, backup, autorização e auditoria.
- Campos de status obedecem transições do processo; usuário não consegue aprovar por UPDATE direto.
- Histórico de auditoria é protegido por grants e políticas. Administradores da infraestrutura ainda possuem poderes: append-only da aplicação não equivale a armazenamento inviolável.

## Autorização

Matriz mínima: papel + membership ativo + unidade autorizada + operação + AAL quando necessário.

Papéis previstos: owner, technical_responsible, analyst, field_technician, reviewer, viewer. Papel administrativo não habilita implicitamente assinatura/revisão técnica. Membership owner pode administrar organização; revisor recebe apenas escopo necessário. Implementar e testar cada permissão explicitamente.

Grants e RLS para SELECT, INSERT, UPDATE e DELETE conforme necessidade, com USING e WITH CHECK apropriados. Checar tanto a linha atual quanto a proposta; impedir que o usuário troque organization_id ou promova seu próprio papel. Políticas de membership devem evitar recursão e serem testadas com usuários reais de teste.

Funções privilegiadas: executar apenas quando indispensável, com search_path fixo, objetos qualificados, EXECUTE limitado e validação interna de identidade/escopo. Chave service-role não deve estar no browser nem ser usada para CRUD comum.

## Documentos

documents guarda identidade e classificação. document_versions guarda caminho imutável, nome original, MIME validado, tamanho, hash SHA-256, autor e data. Uma nova versão usa um novo objeto no Storage.

Storage e banco não formam transação única: usar estados pending → uploaded → verified → available, com retomada idempotente. Não disponibilizar metadado “válido” antes de confirmar o arquivo. Política de reconciliação de órfãos deve primeiro identificar e reportar; remoção exige procedimento autorizado.

Vínculos com evidências precisam de integridade referencial. Preferir tabelas associativas tipadas para requisito, resíduo, medição e protocolo; não introduzir pares livres entity_type/entity_id sem validação.

## Processo e revisão

Proposta de estados: draft → collecting → reviewing → approved → submitted → completed. Transições concretas por tipo ficam versionadas. Devolução retorna à coleta com motivo; edição de conteúdo aprovado cria revisão e invalida gates afetados. Arquivamento é atributo separado.

QA-F exige pessoa distinta do elaborador. approved requer gates aplicáveis e AAL2; submitted requer dados do protocolo; completed requer recibo e QA-G. Caso não haja segundo revisor, mostrar aguardando revisão, preservando a preparação da usuária.

## Dossiê

Cada versão guarda snapshot dos dados, versões dos arquivos, resultados de QA, regras aplicadas e manifest com hashes. Exportar novamente a mesma versão não deve incorporar silenciosamente documentos mais recentes. O protocolo referencia a versão efetivamente submetida.

## Ordem de migrations

1. Identidade, memberships, grants e policies.
2. Empresas/unidades, acesso e constraints de escopo.
3. Acervo e vínculos; processos e auditoria.
4. Resíduos e conciliação.
5. RAPP/água e cálculo.
6. Campo e operações de sync.
7. Revisão/dossiês/protocolos.

Cada lote inclui teste SQL/RLS e dados fictícios. Não publicar migration destrutiva como “rollback automático”.
