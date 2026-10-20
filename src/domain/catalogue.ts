import type { Job } from "./workflow";
export const serviceOptions = [
  { id: "diagnosis", label: "Diagnóstico ambiental" },
  { id: "review", label: "Revisão documental" },
  { id: "waste", label: "Gestão de resíduos" },
  { id: "water", label: "Recursos hídricos" },
  { id: "report", label: "Relatório técnico de atividades" },
  { id: "rapp", label: "Apoio ao RAPP · confirmar aplicabilidade" },
];
export const requirementCatalogue = [
  {
    id: "identity",
    title: "Identificação e documentos da unidade",
    help: "Confira a unidade, o período, a atividade efetiva e as fontes recebidas.",
    sectors: ["gases", "hospital", "other"],
  },
  {
    id: "waste",
    title: "Registros e evidências de resíduos",
    help: "Confira período, unidades de medida, transporte, destinação e relação entre documentos; esclareça diferenças.",
    sectors: ["gases", "other"],
  },
  {
    id: "health-waste",
    title: "Documentação de gestão de resíduos de saúde",
    help: "Confira os serviços e os registros ambientais pertinentes. Não inclua dados de pacientes neste ensaio.",
    sectors: ["hospital"],
  },
  {
    id: "report",
    title: "Relatório técnico revisado",
    help: "Anexe a versão técnica revisada. Este ensaio não elabora declarações oficiais.",
    sectors: ["gases", "hospital", "other"],
  },
  {
    id: "water",
    title: "Confirmar o uso de recursos hídricos",
    help: "Confira origem da água, pontos de uso e escopo antes de definir quais documentos se aplicam.",
    sectors: ["gases", "hospital", "other"],
  },
  {
    id: "licence",
    title: "Licenças e condicionantes · confirmar aplicabilidade",
    help: "Identifique a licença da unidade, autoridade competente, vigência e condicionantes pertinentes ao serviço. Confirme a aplicabilidade com a responsável técnica.",
    sectors: ["gases", "hospital", "other"],
  },
  {
    id: "scope",
    title: "Escopo contratado e período de referência",
    help: "Confirme serviços, unidade, período e exclusões com as partes antes de revisar a documentação.",
    sectors: ["gases", "hospital", "other"],
  },
  {
    id: "rapp",
    title: "RAPP · confirmar enquadramento e período",
    help: "A responsável técnica deve confirmar enquadramento e período nas fontes oficiais antes de solicitar documentos ou preparar declaração.",
    sectors: ["gases", "other"],
  },
];
export function catalogueFor(industry: Job["industry"]) {
  return requirementCatalogue.filter((entry) =>
    entry.sectors.includes(industry),
  );
}
export const catalogueSource =
  "Catálogo operacional Ambientis v0.1 · aplicabilidade e conteúdo técnico pendentes de validação";
