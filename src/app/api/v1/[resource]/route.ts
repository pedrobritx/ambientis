import {
  createSchemas,
  isResource,
  listSchema,
  mutationSchema,
  organizationSchema,
  patchSchemas,
} from "../../../../lib/supabase/contracts";
import {
  ApiError,
  authenticatedClient,
  body,
  databaseError,
  endpoint,
  json,
} from "../../../../lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../../lib/supabase/database.types";
import type { Resource } from "../../../../lib/supabase/contracts";
import { z } from "zod";
type Context = { params: Promise<{ resource: string }> };
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new ApiError(
      422,
      "Confira os campos informados. Não envie campos de autoria ou permissão.",
    );
  return result.data;
}
// Explicit table branches preserve generated Supabase row types at the JSON boundary.
function insertRecord(
  client: SupabaseClient<Database>,
  resource: Resource,
  input: unknown,
) {
  switch (resource) {
    case "companies":
      return client
        .from("companies")
        .insert(parse(createSchemas.companies, input))
        .select()
        .single();
    case "company_contacts":
      return client
        .from("company_contacts")
        .insert(parse(createSchemas.company_contacts, input))
        .select()
        .single();
    case "facilities":
      return client
        .from("facilities")
        .insert(parse(createSchemas.facilities, input))
        .select()
        .single();
    case "processes":
      return client
        .from("processes")
        .insert(parse(createSchemas.processes, input))
        .select()
        .single();
    case "requirements":
      return client
        .from("requirements")
        .insert(parse(createSchemas.requirements, input))
        .select()
        .single();
    case "document_requests":
      return client
        .from("document_requests")
        .insert(parse(createSchemas.document_requests, input))
        .select()
        .single();
  }
}
export function GET(request: Request, context: Context) {
  return endpoint(async () => {
    const { resource } = await context.params;
    if (resource !== "organizations" && !isResource(resource))
      throw new ApiError(404, "Recurso não encontrado.");
    const client = await authenticatedClient(request);
    if (resource === "organizations") {
      const { data, error } = await client
        .from("organizations")
        .select("id,name,created_at")
        .order("id")
        .limit(100);
      if (error) databaseError(error);
      return json({ data });
    }
    const query = parse(
      listSchema,
      Object.fromEntries(new URL(request.url).searchParams),
    );
    let selection = client
      .from(resource)
      .select("*")
      .eq("organization_id", query.organization_id)
      .is("archived_at", null)
      .order("id")
      .limit(query.limit + 1);
    if (query.after) selection = selection.gt("id", query.after);
    const { data, error } = await selection;
    if (error) databaseError(error);
    const rows = data ?? [];
    const hasMore = rows.length > query.limit;
    const result = rows.slice(0, query.limit);
    return json({
      data: result,
      next_cursor: hasMore ? result.at(-1)?.id : null,
    });
  });
}
export function POST(request: Request, context: Context) {
  return endpoint(async () => {
    const { resource } = await context.params;
    if (resource !== "organizations" && !isResource(resource))
      throw new ApiError(404, "Recurso não encontrado.");
    const client = await authenticatedClient(request);
    const input = await body(request);
    if (resource === "organizations") {
      const values = parse(organizationSchema, input);
      const { data, error } = await client.rpc("bootstrap_organization", {
        title: values.name,
      });
      if (error) databaseError(error);
      return json({ data: { id: data } }, 201);
    }
    const { data, error } = await insertRecord(client, resource, input);
    if (error) databaseError(error);
    return json({ data }, 201);
  });
}
export function PATCH(request: Request, context: Context) {
  return endpoint(async () => {
    const { resource } = await context.params;
    if (!isResource(resource))
      throw new ApiError(404, "Recurso não encontrado.");
    const client = await authenticatedClient(request);
    const input = parse(mutationSchema, await body(request));
    const changes = parse(
      patchSchemas[resource] as z.ZodType<Record<string, unknown>>,
      input.changes,
    );
    if (!Object.keys(changes).length)
      throw new ApiError(422, "Informe ao menos um campo para alterar.");
    const { data, error } = await client
      .from(resource)
      .update({ ...changes, version: input.version + 1 })
      .eq("organization_id", input.organization_id)
      .eq("id", input.id)
      .eq("version", input.version)
      .select()
      .maybeSingle();
    if (error) databaseError(error);
    // Never distinguish a foreign/invisible ID from an outdated revision.
    if (!data)
      throw new ApiError(
        409,
        "Registro indisponível ou alterado. Atualize antes de continuar.",
      );
    return json({ data });
  });
}
