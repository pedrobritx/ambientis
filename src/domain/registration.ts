import { z } from "zod";

export const normaliseCnpj = (value: string) =>
  value.replace(/[./\s-]/g, "").toUpperCase();
// Receita Federal's numeric/alpha DV: ASCII - 48, modulus 11, two weighted passes.
export function validCnpj(value: string): boolean {
  const cnpj = normaliseCnpj(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj) || /^(.)\1+$/.test(cnpj)) return false;
  const digit = (base: string) => {
    const weights =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const remainder =
      [...base].reduce(
        (sum, char, i) => sum + (char.charCodeAt(0) - 48) * weights[i],
        0,
      ) % 11;
    return remainder < 2 ? "0" : String(11 - remainder);
  };
  return cnpj.slice(12) === digit(cnpj.slice(0, 12)) + digit(cnpj.slice(0, 13));
}
export const registrationSchema = z.object({
  cnpj: z
    .string()
    .transform(normaliseCnpj)
    .refine(
      (v) => !v || validCnpj(v),
      "CNPJ inválido; confira os dígitos verificadores.",
    )
    .default(""),
  sector: z.enum(["gases", "hospital", "other"]).default("other"),
  cnae: z.string().trim().max(12).default(""),
  cnaeDescription: z.string().trim().max(240).default(""),
  secondaryCnaes: z
    .array(
      z.object({ code: z.string().max(12), description: z.string().max(240) }),
    )
    .max(100)
    .default([]),
  postcode: z.string().trim().max(9).default(""),
  street: z.string().trim().max(200).default(""),
  number: z.string().trim().max(30).default(""),
  district: z.string().trim().max(120).default(""),
  city: z.string().trim().max(120).default(""),
  state: z.string().trim().max(2).default(""),
  registrySource: z.string().max(300).default(""),
  registryCheckedAt: z.string().max(50).default(""),
});
export type Registration = z.infer<typeof registrationSchema>;
export const emptyRegistration = (): Registration =>
  registrationSchema.parse({});
export const sectorOptions = [
  { value: "gases", label: "Gases industriais" },
  { value: "hospital", label: "Hospital / serviços de saúde" },
  { value: "other", label: "Outro setor / a confirmar" },
] as const;

export const contactInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  position: z.string().trim().max(120),
  phone: z.string().trim().max(40),
  email: z.string().trim().toLowerCase().pipe(z.email()),
});
export type ContactInput = z.input<typeof contactInputSchema>;
