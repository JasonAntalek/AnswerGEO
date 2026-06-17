-- Run in Supabase SQL editor after enabling auth

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  business_name text not null,
  city text not null,
  state text not null,
  category text not null,
  last_audited_at timestamptz,
  created_at timestamptz not null default now()
);

alter table audits add column if not exists user_id uuid references profiles(id) on delete set null;
alter table audits add column if not exists business_id uuid references businesses(id) on delete set null;
alter table audits add column if not exists run_number integer not null default 1;

alter table profiles enable row level security;
alter table businesses enable row level security;
alter table audits enable row level security;
alter table audit_results enable row level security;
alter table recommendations enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

create policy "businesses_select_own" on businesses for select using (auth.uid() = user_id);
create policy "businesses_insert_own" on businesses for insert with check (auth.uid() = user_id);
create policy "businesses_update_own" on businesses for update using (auth.uid() = user_id);

create policy "audits_select_own" on audits for select using (auth.uid() = user_id or user_id is null);
create policy "audits_insert_own" on audits for insert with check (auth.uid() = user_id or user_id is null);

create policy "audit_results_select_via_audit" on audit_results for select using (
  exists (
    select 1 from audits
    where audits.id = audit_results.audit_id
      and (audits.user_id = auth.uid() or audits.user_id is null)
  )
);

create policy "recommendations_select_via_audit" on recommendations for select using (
  exists (
    select 1 from audits
    where audits.id = recommendations.audit_id
      and (audits.user_id = auth.uid() or audits.user_id is null)
  )
);
