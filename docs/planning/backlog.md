# Backlog inicial

As issues abaixo foram criadas no repositório. Esta tabela registra a linha de base; o estado atual está nas issues e, após configuração, no Project. Todos os itens começaram em Backlog.

| ID / issue | Fase | Prioridade | Entrega | Dependências |
|---|---|---|---|---|
| [GOV-01 #1](https://github.com/pedrobritx/ambientis/issues/1) | M0 | P0 | Consolidar manual, arquitetura e decisões do Ambientis | — |
| [GOV-02 #2](https://github.com/pedrobritx/ambientis/issues/2) | M0 | P0 | Configurar GitHub Project #12, milestones e proteção de branches | GOV-01 |
| [OPS-01 #3](https://github.com/pedrobritx/ambientis/issues/3) | M0 | P0 | Confirmar elegibilidade dos planos e integração GitHub–Vercel | GOV-01 |
| [APP-01 #4](https://github.com/pedrobritx/ambientis/issues/4) | M1 | P0 | Inicializar Next.js, TypeScript e CI reproduzível | GOV-01 |
| [UX-01 #5](https://github.com/pedrobritx/ambientis/issues/5) | M1 | P1 | Traduzir Meridian Terra em tokens e navegação acessível | APP-01 |
| [AUTH-01 #6](https://github.com/pedrobritx/ambientis/issues/6) | M1 | P0 | Implementar autenticação, recuperação e MFA | APP-01 |
| [DB-01 #7](https://github.com/pedrobritx/ambientis/issues/7) | M1 | P0 | Criar organizações, membros, escopos e políticas RLS | AUTH-01 |
| [BASE-01 #8](https://github.com/pedrobritx/ambientis/issues/8) | M2 | P0 | Cadastrar empresas, unidades, atividades e licenças | DB-01, UX-01 |
| [DOC-01 #9](https://github.com/pedrobritx/ambientis/issues/9) | M2 | P0 | Criar acervo privado com versões e evidências | DB-01, BASE-01 |
| [PROC-01 #10](https://github.com/pedrobritx/ambientis/issues/10) | M2 | P0 | Modelar processos, requisitos, tarefas e auditoria | BASE-01, DOC-01 |
| [WASTE-01 #11](https://github.com/pedrobritx/ambientis/issues/11) | M3 | P0 | Implementar correntes, estoques e movimentações de resíduos | PROC-01 |
| [WASTE-02 #12](https://github.com/pedrobritx/ambientis/issues/12) | M3 | P0 | Reconciliar MTR, CDF, pesagens e inventário | WASTE-01 |
| [DOS-01 #13](https://github.com/pedrobritx/ambientis/issues/13) | M3 | P1 | Entregar dossiê preliminar do primeiro fluxo de resíduos | WASTE-02, DOC-01 |
| [RAPP-01 #14](https://github.com/pedrobritx/ambientis/issues/14) | M4 | P1 | Modelar datasets e memórias de cálculo do RAPP | WASTE-02, PROC-01 |
| [WATER-01 #15](https://github.com/pedrobritx/ambientis/issues/15) | M4 | P1 | Modelar pontos hídricos, medições e avaliação versionada | PROC-01 |
| [FIELD-01 #16](https://github.com/pedrobritx/ambientis/issues/16) | M5 | P1 | Implementar vistoria e captura móvel online | DOC-01, PROC-01, UX-01 |
| [OFF-01 #17](https://github.com/pedrobritx/ambientis/issues/17) | M5 | P1 | Implementar fila offline com sincronização e conflitos | FIELD-01, DB-01 |
| [QA-01 #18](https://github.com/pedrobritx/ambientis/issues/18) | M6 | P0 | Implementar gates QA-A a QA-G e revisão independente | RAPP-01, WATER-01, PROC-01 |
| [DOS-02 #19](https://github.com/pedrobritx/ambientis/issues/19) | M6 | P0 | Gerar dossiê final versionado com protocolos e recibos | QA-01, DOS-01 |
| [OPS-02 #20](https://github.com/pedrobritx/ambientis/issues/20) | M7 | P0 | Implementar backup externo e ensaiar restauração | DOC-01, DOS-02 |
| [SEC-01 #21](https://github.com/pedrobritx/ambientis/issues/21) | M7 | P0 | Validar segurança, privacidade e recuperação | OFF-01, QA-01, OPS-02 |
| [PILOT-01 #22](https://github.com/pedrobritx/ambientis/issues/22) | M7 | P0 | Concluir piloto assistido e liberar operação | OPS-01, SEC-01, DOS-02 |
| [LATER-01 #23](https://github.com/pedrobritx/ambientis/issues/23) | M7 | P2 | Avaliar evolução após piloto e manter backlog de melhorias | PILOT-01 |

## Manutenção

Critérios completos vivem em cada issue. Subdividir uma issue quando não couber em PR revisável, mantendo o ID original como referência e vinculando subtarefas. Não fechar o item pai antes de seus critérios estarem verificados.

[Manifest JSON](backlog.json) e [CSV](backlog.csv) contêm IDs, URLs, fases e dependências para configuração assistida. São uma linha de base, não uma integração automática já em funcionamento.
