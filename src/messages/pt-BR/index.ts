export const m = {
  accessDenied: "Este perfil de demonstração não tem permissão para esta ação.",
  stale:
    "O trabalho foi atualizado em outra aba. Recarregue antes de continuar.",
  required: "Preencha os campos obrigatórios com uma informação válida.",
  missing: "O registro solicitado não está disponível neste trabalho.",
  finalBlocked:
    "A entrega final depende das evidências, do escopo validado e de revisão independente.",
  intermediateReason:
    "Explique o escopo e as pendências desta entrega intermediária.",
  uploadLimit:
    "PDF, TXT ou fotos JPEG, PNG, WebP e HEIC/HEIF de até 1 MiB; limite total de 2 MiB nesta demonstração.",
  fileMismatch: "O conteúdo do arquivo não corresponde ao formato informado.",
  persistence:
    "Não foi possível salvar no navegador. Mantenha esta aba aberta e exporte o trabalho antes de sair.",
  damaged:
    "O rascunho local não pôde ser lido. Ele foi preservado; os exemplos abaixo não o substituem.",
  profilePending:
    "Checklist ilustrativo. A aplicabilidade e o conteúdo técnico ainda precisam de validação profissional.",
  demo: "Demonstração local · Sem dados privados · Sem envio de e-mails",
  submissionRequired:
    "Confirme a declaração demonstrativa antes de enviar a resposta.",
  invalidTransition:
    "Esta ação não está disponível no estado atual do requisito.",
  format: "pt-BR",
} as const;
export const statusLabel = {
  needed: "Evidência em falta",
  requested: "Aguardando empresa",
  review: "Aguardando revisão",
  correction: "Correção solicitada",
  accepted: "Conferido",
  excluded: "Fora do escopo",
} as const;
export const eventLabel: Record<string, string> = {
  request: "Solicitação registrada",
  submit: "Resposta recebida",
  review: "Revisão registrada",
  exclude: "Requisito excluído do escopo",
  restore: "Requisito restaurado",
  add: "Requisito adicionado",
  edit: "Requisito atualizado",
  concern: "Ponto de atenção registrado",
  "resolve-concern": "Ponto de atenção resolvido",
  upload: "Arquivo recebido",
  release: "Entrega de demonstração preparada",
  create: "Trabalho criado",
  "independent-review": "Revisão independente simulada",
  "validate-scope": "Escopo conferido na demonstração",
  invitation: "Convite de demonstração preparado",
  acknowledge: "Recebimento confirmado na demonstração",
};
