import { afterEach, describe, expect, it, vi } from "vitest";
import {
  lookupCompany,
  lookupMunicipalities,
  lookupPostcode,
} from "./brasil-api";
afterEach(() => vi.unstubAllGlobals());
const company = {
  cnpj: "12345678000195",
  razao_social: "Empresa fictícia API",
  cnae_fiscal: 2014200,
  cnae_fiscal_descricao: "Atividade de ensaio",
  municipio: "GOIANIA",
  uf: "GO",
  cep: "74000000",
  qsa: [{ nome_socio: "Do not retain" }],
  email: "do-not-retain@example.test",
};
describe("BrasilAPI boundary", () => {
  it("validates identifiers before any network call and retains only necessary registry fields", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(company)));
    vi.stubGlobal("fetch", fetcher);
    await expect(lookupCompany("invalid")).rejects.toThrow(/CNPJ/);
    expect(fetcher).not.toHaveBeenCalled();
    const result = await lookupCompany("12.345.678/0001-95");
    expect(result.name).toBe(company.razao_social);
    expect(result).not.toHaveProperty("qsa");
    expect(result).not.toHaveProperty("email");
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://brasilapi.com.br/api/cnpj/v1/12345678000195",
    );
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
  });
  it("rejects a mismatched response and reports lookup failures with manual fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...company, cnpj: "11111111000191" })),
        ),
    );
    await expect(lookupCompany("12345678000195")).rejects.toThrow(/inesperado/);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 429 })),
    );
    await expect(lookupPostcode("74000-000")).rejects.toThrow(/Limite/);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(lookupMunicipalities("GO")).rejects.toThrow(/manualmente/);
  });
  it("normalises postcode and municipality data without inferring environmental coverage", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation((url: string) =>
        Promise.resolve(
          new Response(
            JSON.stringify(
              url.includes("cep/")
                ? {
                    cep: "74000000",
                    state: "GO",
                    city: "GOIANIA",
                    street: "Rua de ensaio",
                    neighborhood: null,
                  }
                : [{ nome: "Goiânia", codigo_ibge: "5208707" }],
            ),
          ),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    expect(await lookupPostcode("74000-000")).toMatchObject({
      city: "GOIANIA",
      street: "Rua de ensaio",
      district: "",
    });
    expect(await lookupMunicipalities("GO")).toEqual([
      { name: "Goiânia", code: "5208707" },
    ]);
    await expect(lookupPostcode("short")).rejects.toThrow(/8 dígitos/);
  });
});
