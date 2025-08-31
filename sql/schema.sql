-- Enable extensions
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- Persons
create table if not exists persons (
  id uuid primary key default gen_random_uuid(),
  created_by uuid,
  claimed_by uuid,
  display_name text not null,
  first_name text,
  last_name text,
  alt_names jsonb default '[]'::jsonb,
  sex text check (sex in ('male','female','nonbinary','unknown')) default 'unknown',
  dob date,
  birth_city text,
  birth_country text,
  current_city text,
  current_country text,
  profession text,
  bio text,
  deceased boolean default false,
  date_of_death date,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Relationships
create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  from_person_id uuid references persons(id) on delete cascade,
  to_person_id uuid references persons(id) on delete cascade,
  type text check (type in ('parent','spouse')) not null,
  since date,
  until date,
  source text,
  created_at timestamptz default now()
);
create unique index if not exists uniq_spouses on relationships (least(from_person_id,to_person_id), greatest(from_person_id,to_person_id)) where type = 'spouse';
create index if not exists rel_from_type on relationships (from_person_id, type);
create index if not exists rel_to_type on relationships (to_person_id, type);

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references persons(id) on delete cascade,
  kind text check (kind in ('email','phone','address','social')) not null,
  value text not null,
  label text,
  visibility text check (visibility in ('me','family','extended','public')) default 'family',
  created_at timestamptz default now()
);

-- Simple trigger to auto-set created_by on person insert (using Supabase auth.uid())
-- In Supabase, use a policy rather than trigger; updated_at maintained via trigger.
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists persons_updated_at on persons;
create trigger persons_updated_at before update on persons for each row execute procedure set_updated_at();

-- RLS
alter table persons enable row level security;
alter table relationships enable row level security;
alter table contacts enable row level security;

-- Policies (MVP): Everyone authenticated can read persons; only owner can update their entries.
create policy persons_read on persons for select using ( auth.role() = 'authenticated' );
create policy persons_insert on persons for insert with check ( auth.role() = 'authenticated' );
create policy persons_update on persons for update using ( created_by = auth.uid() or claimed_by = auth.uid() );
create policy persons_delete on persons for delete using ( created_by = auth.uid() );

create policy relationships_read on relationships for select using ( auth.role() = 'authenticated' );
create policy relationships_write on relationships for all using ( auth.role() = 'authenticated' ) with check ( auth.role() = 'authenticated' );

-- Contacts: read if public OR you own/claim the person; write if you own/claim person.
create policy contacts_read on contacts for select using (
  visibility = 'public' OR exists (
    select 1 from persons p where p.id = contacts.person_id and (p.created_by = auth.uid() or p.claimed_by = auth.uid())
  )
);
create policy contacts_write on contacts for all using (
  exists (select 1 from persons p where p.id = contacts.person_id and (p.created_by = auth.uid() or p.claimed_by = auth.uid()))
) with check (
  exists (select 1 from persons p where p.id = contacts.person_id and (p.created_by = auth.uid() or p.claimed_by = auth.uid()))
);

-- Indexes
create index if not exists persons_name_trgm on persons using gin (display_name gin_trgm_ops);
create index if not exists persons_profession_trgm on persons using gin (profession gin_trgm_ops);
create index if not exists persons_birth_city on persons (birth_city);

-- RPC: search_people
create or replace function search_people(
  q_name text default null,
  p_sex text default null,
  birth_city text default null,
  parent_name text default null,
  spouse_name text default null,
  profession text default null
) returns setof persons language sql stable as $$
  with base as (
    select p.* from persons p
    where (q_name is null or p.display_name ilike '%'||q_name||'%')
      and (p_sex is null or p.sex = p_sex)
      and (birth_city is null or p.birth_city ilike birth_city||'%')
      and (profession is null or p.profession ilike '%'||profession||'%')
  ),
  with_parents as (
    select distinct b.*
    from base b
    left join relationships pr on pr.type='parent' and pr.to_person_id = b.id
    left join persons par on par.id = pr.from_person_id
    where (parent_name is null or (par.display_name ilike '%'||parent_name||'%'))
  ),
  with_spouse as (
    select distinct w.*
    from with_parents w
    left join relationships sr on sr.type='spouse' and (sr.from_person_id = w.id or sr.to_person_id = w.id)
    left join persons sp on sp.id = case when sr.from_person_id = w.id then sr.to_person_id else sr.from_person_id end
    where (spouse_name is null or (sp.display_name ilike '%'||spouse_name||'%'))
  )
  select * from with_spouse
  order by display_name asc;
$$;
