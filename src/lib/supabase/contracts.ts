import { z } from "zod";
import { normaliseCnpj, validCnpj } from "../../domain/registration";
const uuid = z.uuid();
const name = z.string().trim().min(1).max(200);
const sector = z.enum(["gases", "hospital", "other"]);
export const createSchemas = {
  companies: z.strictObject({
    organization_id: uuid,
    name,
    sector,
    cnpj: z
      .string()
      .transform(normaliseCnpj)
      .refine(validCnpj)
      .nullable()
      .optional(),
    cnae: z.string().max(12).nullable().optional(),
  }),
  company_contacts: z.strictObject({
    organization_id: uuid,
    company_id: uuid,
    name: name.max(120),
    position: z.string().trim().max(120).default(""),
    email: z
      .email()
      .max(254)
      .transform((v) => v.trim().toLowerCase()),
    phone: z.string().trim().max(40).default(""),
  }),
  facilities: z.strictObject({
    organization_id: uuid,
    company_id: uuid,
    name,
    sector,
    state: z.enum(["GO", "DF"]),
    city: name.max(120),
    postcode: z
      .string()
      .regex(/^\d{8}$/)
      .nullable()
      .optional(),
  }),
  processes: z.strictObject({
    organization_id: uuid,
    facility_id: uuid,
    title: name,
    reporting_period: name.max(120),
    status: z.enum(["draft", "collecting", "reviewing"]).default("draft"),
  }),
  requirements: z.strictObject({
    organization_id: uuid,
    facility_id: uuid,
    process_id: uuid,
    title: name,
    description: z.string().max(4000).default(""),
    source: z.string().max(500).default("manual"),
    shared_with_client: z.boolean().default(false),
  }),
  document_requests: z.strictObject({
    organization_id: uuid,
    facility_id: uuid,
    process_id: uuid,
    requirement_id: uuid,
    message: z.string().trim().min(1).max(4000),
    due_date: z.iso.date().nullable().optional(),
    status: z.enum(["draft", "sent", "cancelled"]).default("draft"),
  }),
} as const;
export type Resource = keyof typeof createSchemas;
export const isResource = (name: string): name is Resource =>
  Object.hasOwn(createSchemas, name);
// PATCH schemas deliberately contain no defaults: omitted fields must stay unchanged.
export const patchSchemas = {
  companies: z
    .strictObject({
      name,
      sector,
      cnpj: z.string().transform(normaliseCnpj).refine(validCnpj).nullable(),
      cnae: z.string().max(12).nullable(),
    })
    .partial(),
  company_contacts: z
    .strictObject({
      name: name.max(120),
      position: z.string().trim().max(120),
      email: z
        .email()
        .max(254)
        .transform((v) => v.trim().toLowerCase()),
      phone: z.string().trim().max(40),
    })
    .partial(),
  facilities: z
    .strictObject({
      name,
      sector,
      state: z.enum(["GO", "DF"]),
      city: name.max(120),
      postcode: z
        .string()
        .regex(/^\d{8}$/)
        .nullable(),
    })
    .partial(),
  processes: z
    .strictObject({
      title: name,
      reporting_period: name.max(120),
      status: z.enum(["draft", "collecting", "reviewing"]),
    })
    .partial(),
  requirements: z
    .strictObject({
      title: name,
      description: z.string().max(4000),
      source: z.string().max(500),
      shared_with_client: z.boolean(),
      applicability: z.enum(["pending", "applicable", "excluded"]),
      exclusion_reason: z.string().trim().max(2000).nullable(),
    })
    .partial(),
  document_requests: z
    .strictObject({
      message: z.string().trim().min(1).max(4000),
      due_date: z.iso.date().nullable(),
      status: z.enum(["draft", "sent", "cancelled"]),
    })
    .partial(),
} as const;
export const mutationSchema = z.strictObject({
  id: uuid,
  organization_id: uuid,
  version: z.number().int().positive(),
  changes: z.record(z.string(), z.unknown()),
});
export const listSchema = z.object({
  organization_id: uuid,
  after: uuid.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export const organizationSchema = z.strictObject({ name: name.max(160) });
