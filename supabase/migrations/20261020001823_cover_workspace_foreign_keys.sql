-- Cover foreign-key checks and membership revocation as the workspace grows.
create index audit_events_actor_idx on public.audit_events(actor_id);
create index companies_author_idx on public.companies(created_by);
create index company_contacts_author_idx on public.company_contacts(created_by);
create index document_requests_author_idx on public.document_requests(created_by);
create index document_requests_parent_idx on public.document_requests(organization_id,facility_id,process_id,requirement_id);
create index facilities_author_idx on public.facilities(created_by);
create index facility_access_member_idx on public.facility_access(organization_id,user_id);
create index organizations_author_idx on public.organizations(created_by);
create index processes_author_idx on public.processes(created_by);
create index requirements_author_idx on public.requirements(created_by);
