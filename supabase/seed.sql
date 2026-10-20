-- Synthetic local development only. Never run this seed against a hosted project.
begin;
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
select '00000000-0000-0000-0000-000000000000', id::uuid, 'authenticated','authenticated',email,
  extensions.crypt('Ambientis-local-only-2026!',extensions.gen_salt('bf')),now(),
  '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),'','','',''
from (values
 ('60000000-0000-4000-8000-000000000001','owner-a@ambientis.test'),
 ('60000000-0000-4000-8000-000000000002','owner-b@ambientis.test'),
 ('60000000-0000-4000-8000-000000000003','client-a@ambientis.test'),
 ('60000000-0000-4000-8000-000000000004','client-b@ambientis.test')
) as users(id,email);
insert into auth.identities(id,provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
select gen_random_uuid(),id::text,id,jsonb_build_object('sub',id::text,'email',email,'email_verified',true),'email',now(),now(),now()
from auth.users where email like '%@ambientis.test';
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select public.bootstrap_organization('Synthetic consultancy A');
insert into public.companies(id,organization_id,name,sector)
select '61000000-0000-4000-8000-000000000001',organization_id,'Synthetic industry A','gases' from public.organization_members where user_id=auth.uid();
insert into public.companies(id,organization_id,name,sector)
select '61000000-0000-4000-8000-000000000002',organization_id,'Synthetic hospital B','hospital' from public.organization_members where user_id=auth.uid();
insert into public.facilities(id,organization_id,company_id,name,sector,state,city)
select '62000000-0000-4000-8000-000000000001',organization_id,id,'Synthetic unit A','gases','GO','Goiânia' from public.companies where id='61000000-0000-4000-8000-000000000001';
insert into public.facilities(id,organization_id,company_id,name,sector,state,city)
select '62000000-0000-4000-8000-000000000002',organization_id,id,'Synthetic unit B','hospital','DF','Brasília' from public.companies where id='61000000-0000-4000-8000-000000000002';
insert into public.processes(id,organization_id,facility_id,title,reporting_period)
select '63000000-0000-4000-8000-000000000001',organization_id,id,'Synthetic diagnosis','2026' from public.facilities where id='62000000-0000-4000-8000-000000000001';
insert into public.requirements(id,organization_id,facility_id,process_id,title,shared_with_client)
select '64000000-0000-4000-8000-000000000001',organization_id,facility_id,id,'Shared synthetic requirement',true from public.processes where id='63000000-0000-4000-8000-000000000001';
insert into public.requirements(id,organization_id,facility_id,process_id,title,shared_with_client)
select '64000000-0000-4000-8000-000000000002',organization_id,facility_id,id,'Internal synthetic requirement',false from public.processes where id='63000000-0000-4000-8000-000000000001';
insert into public.organization_members(organization_id,user_id,role)
select organization_id,'60000000-0000-4000-8000-000000000003','client' from public.companies where id='61000000-0000-4000-8000-000000000001';
insert into public.organization_members(organization_id,user_id,role)
select organization_id,'60000000-0000-4000-8000-000000000004','client' from public.companies where id='61000000-0000-4000-8000-000000000001';
insert into public.facility_access(organization_id,facility_id,user_id)
select organization_id,id,'60000000-0000-4000-8000-000000000003' from public.facilities where id='62000000-0000-4000-8000-000000000001';
insert into public.facility_access(organization_id,facility_id,user_id)
select organization_id,id,'60000000-0000-4000-8000-000000000004' from public.facilities where id='62000000-0000-4000-8000-000000000002';
select set_config('request.jwt.claims','{"sub":"60000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select public.bootstrap_organization('Synthetic consultancy C');
insert into public.companies(id,organization_id,name,sector)
select '61000000-0000-4000-8000-000000000003',organization_id,'Synthetic company C','other' from public.organization_members where user_id=auth.uid();
commit;
