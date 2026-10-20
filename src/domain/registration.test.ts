import { describe, expect, it } from "vitest";
import { validCnpj, registrationSchema } from "./registration";
describe("company registry input", () => {
  it("accepts numeric and Receita's alpha example, preserving identifier letters", () => {
    expect(validCnpj("12.345.678/0001-95")).toBe(true);
    expect(validCnpj("12.ABC.345/01DE-35")).toBe(true);
    expect(registrationSchema.parse({ cnpj: "12.abc.345/01de-35" }).cnpj).toBe(
      "12ABC34501DE35",
    );
    for (const value of [
      "12345678000190",
      "00000000000000",
      "<12345678000195>",
      "12ABC34501DE30",
    ])
      expect(validCnpj(value)).toBe(false);
  });
});
