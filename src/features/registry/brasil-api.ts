import { z } from "zod";
import { normaliseCnpj, validCnpj } from "../../domain/registration";
const BASE = "https://brasilapi.com.br/api";
async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/${path}`, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(8000)])
        : AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      "Consulta indisponível ou sem conexão. Tente novamente ou preencha manualmente.",
    );
  }
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? "Cadastro não encontrado. Você pode preencher os dados manualmente."
        : response.status === 429
          ? "Limite de consultas atingido. Aguarde e tente novamente; o preenchimento manual está disponível."
          : "O serviço não concluiu a consulta. Preencha manualmente ou tente novamente.",
    );
  const data = await response.json().catch(() => {
    throw new Error(
      "Resposta inválida do serviço. Seus campos foram preservados.",
    );
  });
  return data;
}
const companyResponse = z.object({
  cnpj: z.string(),
  razao_social: z.string().min(1).max(160),
  nome_fantasia: z.string().nullable().optional(),
  cnae_fiscal: z.union([z.number(), z.string()]),
  cnae_fiscal_descricao: z.string().max(240),
  cnaes_secundarios: z
    .array(
      z.object({
        codigo: z.union([z.number(), z.string()]),
        descricao: z.string().max(240),
      }),
    )
    .max(100)
    .optional(),
  cep: z.string().nullable().optional(),
  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  municipio: z.string().max(120),
  uf: z.string().length(2),
});
export async function lookupCompany(value: string, signal?: AbortSignal) {
  const cnpj = normaliseCnpj(value);
  if (!validCnpj(cnpj))
    throw new Error("Informe um CNPJ válido antes de consultar.");
  // Only the documented fields are retained; QSA, personal names, emails and phones are discarded.
  const parsed = companyResponse.safeParse(
    await request(`cnpj/v1/${cnpj}`, signal),
  );
  if (!parsed.success || normaliseCnpj(parsed.data.cnpj) !== cnpj)
    throw new Error(
      "O serviço retornou um cadastro inesperado. Confira ou preencha manualmente.",
    );
  const d = parsed.data;
  return {
    name: d.razao_social,
    cnpj,
    cnae: String(d.cnae_fiscal).padStart(7, "0"),
    cnaeDescription: d.cnae_fiscal_descricao,
    secondaryCnaes: (d.cnaes_secundarios ?? []).map((c) => ({
      code: String(c.codigo).padStart(7, "0"),
      description: c.descricao,
    })),
    postcode: d.cep ?? "",
    street: d.logradouro ?? "",
    number: d.numero ?? "",
    district: d.bairro ?? "",
    city: d.municipio,
    state: d.uf,
    registrySource: `${BASE}/cnpj/v1/${cnpj}`,
    registryCheckedAt: new Date().toISOString(),
  };
}
const addressResponse = z.object({
  cep: z.string(),
  state: z.string().length(2),
  city: z.string().max(120),
  neighborhood: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
});
export async function lookupPostcode(value: string, signal?: AbortSignal) {
  const postcode = value.replace(/[\s-]/g, "");
  if (!/^\d{8}$/.test(postcode))
    throw new Error("Informe um CEP com 8 dígitos.");
  const parsed = addressResponse.safeParse(
    await request(`cep/v2/${postcode}`, signal),
  );
  if (!parsed.success || parsed.data.cep.replace(/\D/g, "") !== postcode)
    throw new Error(
      "O serviço retornou um endereço inesperado. Preencha manualmente.",
    );
  return {
    postcode,
    state: parsed.data.state,
    city: parsed.data.city,
    district: parsed.data.neighborhood ?? "",
    street: parsed.data.street ?? "",
  };
}
export async function lookupMunicipalities(
  state: "GO" | "DF",
  signal?: AbortSignal,
) {
  const parsed = z
    .array(
      z.object({
        nome: z.string().min(1).max(120),
        codigo_ibge: z.union([z.string(), z.number()]),
      }),
    )
    .max(1000)
    .safeParse(await request(`ibge/municipios/v1/${state}`, signal));
  if (!parsed.success)
    throw new Error(
      "A lista de localidades não pôde ser lida. Preencha manualmente.",
    );
  return parsed.data.map((d) => ({
    name: d.nome,
    code: String(d.codigo_ibge),
  }));
}
