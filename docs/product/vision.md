# Visão, escopo e critérios de sucesso

## Usuária e necessidade

Primeira usuária: bióloga responsável por trabalhos ambientais, com poucos colaboradores. O Ambientis deve reduzir recadastro e tornar visível o que falta para concluir um trabalho confiável.

Empresa e unidade são permanentes. Processo representa um trabalho de determinado tipo, escopo e exercício. O dossiê resulta dos registros validados, com esta cadeia:

**requisito → dado → cálculo → evidência → revisão → declaração → protocolo → recibo**

## Primeira entrega útil

Cadastrar uma unidade fictícia, anexar evidências versionadas, registrar correntes e movimentos de resíduos, reconciliar divergências e exportar um inventário preliminar rastreável. Esse fluxo chega em M3; a liberação para operação real depende de M7.

## Escopo da primeira versão operacional

- Identidade, organizações, membros, permissões por unidade e MFA para ações críticas.
- Empresas, unidades, atividades, cadastros, licenças e condicionantes.
- Processos e exercícios, requisitos, tarefas, pendências e histórico.
- Acervo privado, versões, fotos e relações entre evidências e requisitos.
- Resíduos, estoques, MTR/CDF/pesagens, conciliação e inventário.
- Datasets e memórias do RAPP; pontos hídricos e medições.
- Vistoria móvel com captura offline limitada e sincronização explícita.
- Gates QA, revisão independente, dossiê lógico, protocolo e recibo.
- Backups, restauração e operação assistida.

## Evolução posterior

Extração assistida por IA, PDF integral consolidado, mapas avançados, integrações oficiais, cobrança e autosserviço de múltiplos clientes. Cada item depende de necessidade demonstrada no piloto. Não criar microserviços, portal comercial ou motor genérico de workflows nesta fase.

## Sucesso observável

- A usuária conclui a jornada sem assistência para localizar o próximo passo.
- Cada quantidade declarada leva à fonte e à memória de cálculo.
- Dados ausentes e divergentes são identificados, nunca preenchidos como zero implicitamente.
- Mudanças após revisão preservam histórico e exigem nova validação pertinente.
- Tentativas de acesso fora do escopo são negadas pelo backend.
- Um backup completo é restaurado e o dossiê confere com seu manifest.
- Custos e limitações são conhecidos e aceitos antes de operação real.

## Papéis

Pedro: responsável pelo produto e implementação. Responsável técnica: domínio, UX do trabalho e aceite profissional. Revisor independente: QA pré-protocolo, podendo ser colaborador convidado com escopo restrito. Usar uma só pessoa no início não autoriza simular uma segunda revisão.

BSDL permanece a base filosófica/de design; Meridian, a metodologia de produto; BSF, os processos de construção. Meridian Terra orienta esta interface. Não há redefinição desses conceitos neste manual.
