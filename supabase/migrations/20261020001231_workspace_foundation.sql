-- Additive foundation: no client records or accounts are seeded.
create schema if not exists ambientis_private;
revoke all on schema ambientis_private from public, anon;
grant usage on schema ambientis_private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id),
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  created_at timestamptz not null default now()
);
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create table public.organization_members (
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('owner','technical_responsible','analyst','field_technician','reviewer','viewer','client')),
  active boolean not null default true,
  primary key (organization_id, user_id)
);
create index organization_members_user_idx on public.organization_members(user_id, organization_id) where active;

create function ambientis_private.valid_cnpj(value text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare weights integer[]; total integer; digit integer; pass integer; i integer;
begin
  if value !~ '^[A-Z0-9]{12}[0-9]{2}$' or value = repeat(left(value,1),14) then return false; end if;
  for pass in 1..2 loop
    weights := case when pass=1 then array[5,4,3,2,9,8,7,6,5,4,3,2] else array[6,5,4,3,2,9,8,7,6,5,4,3,2] end;
    total := 0;
    for i in 1..(11+pass) loop total := total + (ascii(substr(value,i,1))-48)*weights[i]; end loop;
    digit := total % 11; digit := case when digit < 2 then 0 else 11-digit end;
    if digit <> substr(value,12+pass,1)::integer then return false; end if;
  end loop;
  return true;
end $$;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null check (length(trim(name)) between 1 and 200),
  cnpj text check (cnpj is null or ambientis_private.valid_cnpj(cnpj)),
  sector text not null check (sector in ('gases','hospital','other')),
  cnae text check (length(cnae) <= 12),
  unique (organization_id, cnpj),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (organization_id, id)
);
create index companies_org_idx on public.companies(organization_id);

create table public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  company_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 120),
  position text not null default '' check (length(position) <= 120),
  email text not null check (email = lower(trim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' and length(email) <= 254),
  phone text not null default '' check (length(phone) <= 40),
  unique (organization_id, company_id, email),
  foreign key (organization_id, company_id) references public.companies(organization_id,id),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (organization_id, id)
);
create index company_contacts_org_idx on public.company_contacts(organization_id);
create index company_contacts_company_idx on public.company_contacts(organization_id,company_id);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  company_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 200),
  sector text not null check (sector in ('gases','hospital','other')),
  state text not null check (state in ('GO','DF')),
  city text not null check (length(trim(city)) between 1 and 120),
  postcode text check (postcode ~ '^[0-9]{8}$'),
  foreign key (organization_id, company_id) references public.companies(organization_id,id),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (organization_id, id)
);
create index facilities_org_idx on public.facilities(organization_id);
create index facilities_company_idx on public.facilities(organization_id,company_id);

create table public.processes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  facility_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 200),
  reporting_period text not null check (length(trim(reporting_period)) between 1 and 120),
  status text not null default 'draft' check (status in ('draft','collecting','reviewing')),
  unique (organization_id, facility_id, id),
  foreign key (organization_id, facility_id) references public.facilities(organization_id,id),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (organization_id, id)
);
create index processes_org_idx on public.processes(organization_id);
create index processes_facility_idx on public.processes(organization_id,facility_id);

create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  facility_id uuid not null,
  process_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 200),
  description text not null default '' check (length(description) <= 4000),
  source text not null default 'manual' check (length(source) <= 500),
  applicability text not null default 'pending' check (applicability in ('pending','applicable','excluded')),
  exclusion_reason text check (length(exclusion_reason) <= 2000),
  shared_with_client boolean not null default false,
  check (applicability <> 'excluded' or length(trim(exclusion_reason)) > 0),
  check (applicability <> 'excluded' or exclusion_reason is not null),
  unique (organization_id, facility_id, process_id, id),
  foreign key (organization_id, facility_id, process_id) references public.processes(organization_id,facility_id,id),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (organization_id, id)
);
create index requirements_org_idx on public.requirements(organization_id);
create index requirements_facility_idx on public.requirements(organization_id,facility_id);
create index requirements_process_idx on public.requirements(organization_id,process_id);

create table public.document_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  facility_id uuid not null,
  process_id uuid not null,
  requirement_id uuid not null,
  message text not null check (length(trim(message)) between 1 and 4000),
  due_date date,
  status text not null default 'draft' check (status in ('draft','sent','cancelled')),
  foreign key (organization_id, facility_id, process_id, requirement_id) references public.requirements(organization_id,facility_id,process_id,id),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (organization_id, id)
);
create index document_requests_org_idx on public.document_requests(organization_id);
create index document_requests_facility_idx on public.document_requests(organization_id,facility_id);
create index document_requests_process_idx on public.document_requests(organization_id,process_id);

create index document_requests_requirement_idx on public.document_requests(organization_id, requirement_id);
create table public.facility_access (
  organization_id uuid not null,
  facility_id uuid not null,
  user_id uuid not null,
  primary key (organization_id,facility_id,user_id),
  foreign key (organization_id,user_id) references public.organization_members(organization_id,user_id),
  foreign key (organization_id,facility_id) references public.facilities(organization_id,id)
);
create index facility_access_user_idx on public.facility_access(user_id,organization_id,facility_id);
create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id),
  actor_id uuid references auth.users(id),
  table_name text not null,
  record_id uuid not null,
  operation text not null,
  record_version integer,
  occurred_at timestamptz not null default now()
);
create index audit_events_org_time_idx on public.audit_events(organization_id,occurred_at desc);

-- Scope is read from live membership rows, never editable user_metadata/JWT roles.
create function ambientis_private.member_role(org uuid) returns text
language sql stable security definer set search_path = '' as $$
  select role from public.organization_members where organization_id=org and user_id=(select auth.uid()) and active
$$;
create function ambientis_private.can_access_facility(org uuid, facility uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select ambientis_private.member_role(org) = 'owner' or (
    ambientis_private.member_role(org) is not null and exists (
      select 1 from public.facility_access where organization_id=org and facility_id=facility and user_id=(select auth.uid())
    ))
$$;
create function ambientis_private.can_manage_facility(org uuid, facility uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select ambientis_private.member_role(org) in ('owner','technical_responsible','analyst')
    and ambientis_private.can_access_facility(org,facility)
$$;
create function ambientis_private.can_read_company(org uuid, company uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select ambientis_private.member_role(org)='owner' or exists (
    select 1 from public.facilities f where f.organization_id=org and f.company_id=company
      and ambientis_private.can_access_facility(org,f.id)
  )
$$;
create function ambientis_private.bootstrap_organization(title text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare org uuid;
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  -- Serialize bootstrap per account; repeated requests return the existing workspace.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select organization_id into org from public.organization_members where user_id=auth.uid() and role='owner' and active limit 1;
  if org is not null then return org; end if;
  insert into public.organizations(name) values(trim(title)) returning id into org;
  insert into public.organization_members(organization_id,user_id,role) values(org,auth.uid(),'owner');
  insert into public.audit_events(organization_id,actor_id,table_name,record_id,operation) values(org,auth.uid(),'organizations',org,'INSERT');
  return org;
end $$;
-- Only the invoker wrapper is exposed through PostgREST.
create function public.bootstrap_organization(title text) returns uuid
language sql security invoker set search_path = '' as $$ select ambientis_private.bootstrap_organization(title) $$;

create function ambientis_private.guard_record() returns trigger
language plpgsql set search_path = '' as $$
declare key text;
begin
  if tg_op='INSERT' then
    new.created_by := auth.uid(); new.created_at := now(); new.updated_at := now(); new.version := 1;
  else
    foreach key in array array['id','organization_id','company_id','facility_id','process_id','requirement_id','created_by','created_at'] loop
      if (to_jsonb(old)->key) is distinct from (to_jsonb(new)->key) then
        raise exception 'Record identity is immutable' using errcode='23514';
      end if;
    end loop;
    if tg_table_name='companies' and to_jsonb(old)->>'cnpj' is not null and (to_jsonb(old)->>'cnpj') is distinct from (to_jsonb(new)->>'cnpj') then
      raise exception 'CNPJ identity is immutable' using errcode='23514';
    end if;
    if new.version <> old.version+1 then raise exception 'Version conflict' using errcode='40001'; end if;
    new.updated_at := now();
  end if;
  return new;
end $$;
create function ambientis_private.audit_record() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_events(organization_id,actor_id,table_name,record_id,operation,record_version)
    values(new.organization_id,auth.uid(),tg_table_name,new.id,tg_op,new.version);
  return new;
end $$;

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

alter table public.organizations enable row level security;
revoke all on public.organizations from anon, authenticated;
grant select on public.organizations to authenticated;

alter table public.organization_members enable row level security;
revoke all on public.organization_members from anon, authenticated;
grant select on public.organization_members to authenticated;

alter table public.companies enable row level security;
revoke all on public.companies from anon, authenticated;
grant select on public.companies to authenticated;

alter table public.company_contacts enable row level security;
revoke all on public.company_contacts from anon, authenticated;
grant select on public.company_contacts to authenticated;

alter table public.facilities enable row level security;
revoke all on public.facilities from anon, authenticated;
grant select on public.facilities to authenticated;

alter table public.processes enable row level security;
revoke all on public.processes from anon, authenticated;
grant select on public.processes to authenticated;

alter table public.requirements enable row level security;
revoke all on public.requirements from anon, authenticated;
grant select on public.requirements to authenticated;

alter table public.document_requests enable row level security;
revoke all on public.document_requests from anon, authenticated;
grant select on public.document_requests to authenticated;

alter table public.facility_access enable row level security;
revoke all on public.facility_access from anon, authenticated;
grant select on public.facility_access to authenticated;

alter table public.audit_events enable row level security;
revoke all on public.audit_events from anon, authenticated;
grant select on public.audit_events to authenticated;

create trigger companies_guard before insert or update on public.companies for each row execute function ambientis_private.guard_record();
create trigger companies_audit after insert or update on public.companies for each row execute function ambientis_private.audit_record();
grant insert on public.companies to authenticated;
grant update (name,cnpj,sector,cnae,archived_at,version) on public.companies to authenticated;

create trigger company_contacts_guard before insert or update on public.company_contacts for each row execute function ambientis_private.guard_record();
create trigger company_contacts_audit after insert or update on public.company_contacts for each row execute function ambientis_private.audit_record();
grant insert on public.company_contacts to authenticated;
grant update (name,position,email,phone,archived_at,version) on public.company_contacts to authenticated;

create trigger facilities_guard before insert or update on public.facilities for each row execute function ambientis_private.guard_record();
create trigger facilities_audit after insert or update on public.facilities for each row execute function ambientis_private.audit_record();
grant insert on public.facilities to authenticated;
grant update (name,sector,state,city,postcode,archived_at,version) on public.facilities to authenticated;

create trigger processes_guard before insert or update on public.processes for each row execute function ambientis_private.guard_record();
create trigger processes_audit after insert or update on public.processes for each row execute function ambientis_private.audit_record();
grant insert on public.processes to authenticated;
grant update (title,reporting_period,status,archived_at,version) on public.processes to authenticated;

create trigger requirements_guard before insert or update on public.requirements for each row execute function ambientis_private.guard_record();
create trigger requirements_audit after insert or update on public.requirements for each row execute function ambientis_private.audit_record();
grant insert on public.requirements to authenticated;
grant update (title,description,source,applicability,exclusion_reason,shared_with_client,archived_at,version) on public.requirements to authenticated;

create trigger document_requests_guard before insert or update on public.document_requests for each row execute function ambientis_private.guard_record();
create trigger document_requests_audit after insert or update on public.document_requests for each row execute function ambientis_private.audit_record();
grant insert on public.document_requests to authenticated;
grant update (message,due_date,status,archived_at,version) on public.document_requests to authenticated;

grant insert (id,display_name), update (display_name) on public.profiles to authenticated;
create policy profiles_self on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy profiles_create_self on public.profiles for insert to authenticated with check (id=(select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy org_read on public.organizations for select to authenticated using (ambientis_private.member_role(id) is not null);
create policy membership_read on public.organization_members for select to authenticated using (user_id=(select auth.uid()) or ambientis_private.member_role(organization_id)='owner');
create policy access_read on public.facility_access for select to authenticated using (user_id=(select auth.uid()) or ambientis_private.member_role(organization_id)='owner');
create policy company_read on public.companies for select to authenticated using (ambientis_private.can_read_company(organization_id,id));
create policy company_insert on public.companies for insert to authenticated with check (ambientis_private.member_role(organization_id)='owner');
create policy company_update on public.companies for update to authenticated using (ambientis_private.member_role(organization_id)='owner') with check (ambientis_private.member_role(organization_id)='owner');
create policy contacts_read on public.company_contacts for select to authenticated using (ambientis_private.member_role(organization_id) <> 'client' and ambientis_private.can_read_company(organization_id,company_id));
create policy contacts_insert on public.company_contacts for insert to authenticated with check (ambientis_private.member_role(organization_id)='owner');
create policy contacts_update on public.company_contacts for update to authenticated using (ambientis_private.member_role(organization_id)='owner') with check (ambientis_private.member_role(organization_id)='owner');
create policy facility_read on public.facilities for select to authenticated using (ambientis_private.can_access_facility(organization_id,id));
create policy facility_insert on public.facilities for insert to authenticated with check (ambientis_private.member_role(organization_id)='owner');
create policy facility_update on public.facilities for update to authenticated using (ambientis_private.can_manage_facility(organization_id,id)) with check (ambientis_private.can_manage_facility(organization_id,id));
create policy process_read on public.processes for select to authenticated using (ambientis_private.can_access_facility(organization_id,facility_id));
create policy process_insert on public.processes for insert to authenticated with check (ambientis_private.can_manage_facility(organization_id,facility_id));
create policy process_update on public.processes for update to authenticated using (ambientis_private.can_manage_facility(organization_id,facility_id)) with check (ambientis_private.can_manage_facility(organization_id,facility_id));
create policy requirement_read on public.requirements for select to authenticated using (ambientis_private.can_access_facility(organization_id,facility_id) and (ambientis_private.member_role(organization_id) <> 'client' or shared_with_client));
create policy requirement_insert on public.requirements for insert to authenticated with check (ambientis_private.can_manage_facility(organization_id,facility_id));
create policy requirement_update on public.requirements for update to authenticated using (ambientis_private.can_manage_facility(organization_id,facility_id)) with check (ambientis_private.can_manage_facility(organization_id,facility_id));
create policy request_read on public.document_requests for select to authenticated using (ambientis_private.can_access_facility(organization_id,facility_id) and (ambientis_private.member_role(organization_id) <> 'client' or (status='sent' and exists (select 1 from public.requirements r where r.organization_id=document_requests.organization_id and r.id=document_requests.requirement_id and r.shared_with_client))));
create policy request_insert on public.document_requests for insert to authenticated with check (ambientis_private.can_manage_facility(organization_id,facility_id));
create policy request_update on public.document_requests for update to authenticated using (ambientis_private.can_manage_facility(organization_id,facility_id)) with check (ambientis_private.can_manage_facility(organization_id,facility_id));
create policy audit_owner_read on public.audit_events for select to authenticated using (ambientis_private.member_role(organization_id)='owner');

revoke execute on all functions in schema ambientis_private from public, anon, authenticated;
grant execute on function ambientis_private.valid_cnpj(text), ambientis_private.member_role(uuid), ambientis_private.can_access_facility(uuid,uuid), ambientis_private.can_manage_facility(uuid,uuid), ambientis_private.can_read_company(uuid,uuid), ambientis_private.bootstrap_organization(text) to authenticated;
revoke execute on function public.bootstrap_organization(text) from public, anon;
grant execute on function public.bootstrap_organization(text) to authenticated;
