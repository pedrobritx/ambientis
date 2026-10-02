# UX — Meridian Terra e jornadas

## Decisões recuperadas

Interface mobile-first, navegação guiada, continuidade do trabalho e progresso associado à qualidade. Navegação móvel: **Início, Trabalho, captura (+), Acervo e Mais**. Em telas maiores, navegação lateral com espaço para pendências, ajuda e configurações.

Os tokens exatos de cor, tipografia, ícones e materiais não estavam disponíveis integralmente no histórico consultado. A issue UX-01 deve recuperar a referência ou submeter uma proposta explícita. Não declarar novos tokens como previamente aprovados.

## Mapa de telas

| Área | Telas e ação principal | Estado de falha / recuperação |
|---|---|---|
| Acesso | Login, recuperação, MFA e primeiro acesso | Sessão expirada preserva rascunho seguro; erro sem revelar existência de conta |
| Início | Próximas ações, prazos e continuar trabalho | Vazio oferece criar unidade; falha oferece tentar novamente |
| Trabalho | Empresas → unidades → processos por exercício | Sem permissão explica como pedir acesso; arquivados permanecem consultáveis |
| Unidade | Atividades, cadastros, licenças e condicionantes | Data ausente aparece pendente, nunca vigente por omissão |
| Processo | Resumo, etapas, requisitos, pendências e responsáveis | Etapa bloqueada lista motivo e ação para resolver |
| Captura | Foto, documento, resíduo, ponto hídrico, medição, nota | Câmera/GPS negados permitem arquivo/entrada manual |
| Acervo | Busca, filtros, documento, versões e relações | Upload interrompido mostra progresso e retomada |
| Resíduos | Correntes, movimentos, estoque e reconciliação | Divergência mantém valores originais e pede justificativa |
| RAPP | Dataset, fonte, memória e revisão | Informação insuficiente pede complemento |
| Recursos hídricos | Ponto, coordenadas, medições, cálculo e análise conjunta | Regra não validada mostra requer revisão |
| QA | Checklist, evidências, devolução e aprovação | Sem revisor distinto, aguarda revisão |
| Dossiê | Índice, prévia, versões, exportação e manifest | Exportação incompleta não recebe selo de concluída |
| Protocolo | Órgão, número, data, comprovante e recibo | Sem recibo, manter pendência pós-protocolo |
| Mais | Perfil, preferências, equipe, configurações e ajuda | Mudança sensível exige reconfirmação e permissão |

## Princípios verificáveis

- Hierarquia: uma ação principal por contexto; detalhes técnicos em expansão.
- Progresso: contar critérios cumpridos, pendências e evidências; sem premiar velocidade de declaração.
- PT-BR inicial; textos separados de regras, datas/quantidades localizadas, termos profissionais preservados.
- Formulários com labels, ajuda, erro associado ao campo e resumo acessível.
- Teclado completo, foco visível, retorno de foco após diálogo, contraste e zoom a 200%.
- Cor nunca é o único indicador. Respeitar redução de movimento.
- Manter contexto de organização, unidade e exercício visível nas ações técnicas.
- Salvamento distingue “rascunho neste dispositivo”, “enviando”, “sincronizado”, “conflito” e “falhou”.
- Antes de sair da conta com fila pendente, explicar o risco e oferecer sincronização/recuperação segura. Não apagar silenciosamente rascunhos.

## Jornada de validação

Com dados sintéticos: login → unidade → inventário → captura → evidência → divergência → correção → revisão → dossiê preliminar. Depois: QA independente → dossiê final → protocolo → recibo. Validar em smartphone e desktop com a usuária; registrar obstáculos e PRs de correção.
