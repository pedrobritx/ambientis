import { describe, expect, it } from "vitest";
import { createSchemas, patchSchemas, mutationSchema } from "./contracts";
import { body, endpoint, ApiError, authenticatedClient } from "./server";
const org = "10000000-0000-4000-8000-000000000001";
describe("API boundary", () => {
  it("rejects authorization, authorship and identity fields in writes", () => {
    expect(
      createSchemas.companies.safeParse({
        organization_id: org,
        name: "Example",
        sector: "other",
        created_by: org,
      }).success,
    ).toBe(false);
    expect(patchSchemas.facilities.safeParse({ company_id: org }).success).toBe(
      false,
    );
    expect(
      mutationSchema.safeParse({
        id: org,
        organization_id: org,
        version: 0,
        changes: {},
      }).success,
    ).toBe(false);
    expect(
      createSchemas.companies.parse({
        organization_id: org,
        name: "Example",
        sector: "other",
        cnpj: "19.131.243/0001-97",
      }).cnpj,
    ).toBe("19131243000197");
  });
  it("does not replace omitted PATCH fields with creation defaults", () => {
    expect(patchSchemas.company_contacts.parse({ name: "Updated" })).toEqual({
      name: "Updated",
    });
    expect(patchSchemas.requirements.parse({ title: "Updated" })).toEqual({
      title: "Updated",
    });
    expect(
      patchSchemas.document_requests.parse({ message: "Updated" }),
    ).toEqual({ message: "Updated" });
  });
  it("does not accept a missing or anonymous application key as a user session", async () => {
    await expect(
      authenticatedClient(new Request("http://localhost/api/v1/companies")),
    ).rejects.toMatchObject({ status: 401 });
  });
  it("bounds bodies and returns safe errors without provider details", async () => {
    await expect(
      body(new Request("http://localhost", { method: "POST", body: "x" })),
    ).rejects.toMatchObject({ status: 415 });
    await expect(
      body(
        new Request("http://localhost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "x".repeat(33000) }),
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
    const response = await endpoint(async () => {
      throw new Error("private provider detail");
    });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private provider detail");
    const denied = await endpoint(async () => {
      throw new ApiError(403, "Acesso negado.");
    });
    expect(denied.headers.get("cache-control")).toBe("private, no-store");
    expect(denied.status).toBe(403);
  });
});
