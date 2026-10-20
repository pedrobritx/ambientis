import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const db = new PGlite();
const owner = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const guest = "10000000-0000-4000-8000-000000000003";
let org: string, company: string, facility: string, process: string;
async function user(id: string) {
  await db.exec(
    `reset role; select set_config('request.jwt.claims','{"sub":"${id}","role":"authenticated"}',false); set role authenticated;`,
  );
}
async function rows(sql: string) {
  return (await db.query<Record<string, string>>(sql)).rows;
}
beforeAll(async () => {
  await db.exec(
    `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); grant usage on schema auth to authenticated; create function auth.uid() returns uuid language sql stable as $$ select (current_setting('request.jwt.claims',true)::jsonb->>'sub')::uuid $$; create function auth.jwt() returns jsonb language sql stable as $$ select current_setting('request.jwt.claims',true)::jsonb $$; insert into auth.users values ('${owner}'),('${other}'),('${guest}');`,
  );
  for (const file of readdirSync("supabase/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  await user(owner);
  org = (
    await rows(
      "select public.bootstrap_organization('Synthetic consultancy') as id",
    )
  )[0].id;
  company = (
    await rows(
      `insert into public.companies(organization_id,name,sector) values('${org}','Synthetic industry','gases') returning id`,
    )
  )[0].id;
  facility = (
    await rows(
      `insert into public.facilities(organization_id,company_id,name,sector,state,city) values('${org}','${company}','Synthetic unit','gases','GO','Goiânia') returning id`,
    )
  )[0].id;
  process = (
    await rows(
      `insert into public.processes(organization_id,facility_id,title,reporting_period) values('${org}','${facility}','Synthetic diagnosis','2026') returning id`,
    )
  )[0].id;
}, 30000);
afterAll(() => db.close());
describe("Database grants, RLS and integrity", () => {
  it("creates one workspace atomically and does not duplicate it on retries", async () => {
    await user(owner);
    expect(
      (await rows("select public.bootstrap_organization('Retry') as id"))[0].id,
    ).toBe(org);
    expect(
      (await rows("select * from public.organization_members"))[0].role,
    ).toBe("owner");
  });
  it("denies another consultancy's reads, inserts and tenant reassignment", async () => {
    await user(other);
    expect(await rows("select * from public.companies")).toEqual([]);
    await expect(
      db.exec(
        `insert into public.companies(organization_id,name,sector) values('${org}','Forbidden','other')`,
      ),
    ).rejects.toThrow(/row-level security/);
    const foreignOrg = (
      await rows(
        "select public.bootstrap_organization('Other consultancy') as id",
      )
    )[0].id;
    await expect(
      db.exec(
        `insert into public.facilities(organization_id,company_id,name,sector,state,city) values('${foreignOrg}','${company}','Cross-tenant','gases','GO','Goiânia')`,
      ),
    ).rejects.toThrow(/foreign key/);
    await user(owner);
    await expect(
      db.exec(
        `update public.companies set organization_id='${foreignOrg}',version=version+1 where id='${company}'`,
      ),
    ).rejects.toThrow(/permission denied/);
  });
  it("requires explicit facility access, keeps internal requirements private and revokes access immediately", async () => {
    await db.exec(
      `reset role; insert into public.organization_members values('${org}','${guest}','client',true);`,
    );
    await user(guest);
    expect(await rows("select * from public.companies")).toEqual([]);
    await db.exec(
      `reset role; insert into public.facility_access values('${org}','${facility}','${guest}');`,
    );
    await user(owner);
    await db.exec(
      `insert into public.requirements(organization_id,facility_id,process_id,title,shared_with_client) values('${org}','${facility}','${process}','Internal',false),('${org}','${facility}','${process}','Shared',true);`,
    );
    await user(guest);
    expect((await rows("select * from public.companies")).length).toBe(1);
    expect(
      (await rows("select title from public.requirements")).map((r) => r.title),
    ).toEqual(["Shared"]);
    await expect(
      db.exec(
        `insert into public.requirements(organization_id,facility_id,process_id,title) values('${org}','${facility}','${process}','Client edit')`,
      ),
    ).rejects.toThrow(/row-level security/);
    await expect(
      db.exec(
        "update public.organization_members set role='owner' where user_id=auth.uid()",
      ),
    ).rejects.toThrow(/permission denied/);
    expect(await rows("select * from public.company_contacts")).toEqual([]);
    expect(await rows("select * from public.audit_events")).toEqual([]);
    await db.exec(
      `reset role; update public.organization_members set active=false where user_id='${guest}';`,
    );
    await user(guest);
    expect(await rows("select * from public.facilities")).toEqual([]);
  });
  it("keeps optimistic revisions and protected authorship; rejects missing exclusion reasons and invalid CNPJ", async () => {
    await user(owner);
    await expect(
      db.exec(
        `update public.companies set name='Stale edit' where id='${company}'`,
      ),
    ).rejects.toThrow(/Version conflict/);
    await db.exec(
      `update public.companies set name='Revised',version=2 where id='${company}' and version=1`,
    );
    expect(
      (
        await rows(
          `select name,version from public.companies where id='${company}'`,
        )
      )[0],
    ).toMatchObject({ name: "Revised", version: 2 });
    await expect(
      db.exec(
        `update public.companies set created_by='${other}',version=3 where id='${company}'`,
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      db.exec(
        `update public.requirements set applicability='excluded',version=2 where title='Shared'`,
      ),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.exec(
        `insert into public.companies(organization_id,name,sector,cnpj) values('${org}','Invalid','other','00000000000000')`,
      ),
    ).rejects.toThrow(/check constraint/);
    await db.exec(
      `insert into public.companies(organization_id,name,sector,cnpj) values('${org}','Numeric CNPJ','other','19131243000197'),('${org}','Alpha CNPJ','other','12ABC34501DE35')`,
    );
    expect(
      (await rows("select count(*)::text as count from public.audit_events"))[0]
        .count,
    ).not.toBe("0");
    await expect(db.exec("delete from public.audit_events")).rejects.toThrow(
      /permission denied/,
    );
  });
  it("denies anonymous access to data and workspace bootstrap", async () => {
    await db.exec("reset role; set role anon;");
    await expect(db.exec("select * from public.companies")).rejects.toThrow(
      /permission denied/,
    );
    await expect(
      db.exec("select public.bootstrap_organization('Anonymous')"),
    ).rejects.toThrow(/permission denied/);
  });
});
