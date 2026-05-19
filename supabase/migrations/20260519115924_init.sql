-- Tiny CRM initial schema

create extension if not exists "pgcrypto";

-- ---------- Helpers ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Profiles ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------- People ----------

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  relationship_type text check (
    relationship_type is null or relationship_type in (
      'friend',
      'family',
      'work',
      'mentor',
      'neighbor',
      'community',
      'other'
    )
  ),
  birthday date,
  phone text,
  email text,
  notes text,
  preferred_contact_method text check (
    preferred_contact_method is null or preferred_contact_method in (
      'text',
      'call',
      'email',
      'in_person',
      'video',
      'other'
    )
  ),
  follow_up_interval_days integer check (
    follow_up_interval_days is null or follow_up_interval_days > 0
  ),
  last_contacted_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people enable row level security;

create policy "Users can view their own people"
on public.people
for select
using (user_id = auth.uid());

create policy "Users can create their own people"
on public.people
for insert
with check (user_id = auth.uid());

create policy "Users can update their own people"
on public.people
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own people"
on public.people
for delete
using (user_id = auth.uid());

create trigger people_set_updated_at
before update on public.people
for each row
execute function public.set_updated_at();

create index people_user_id_idx on public.people(user_id);
create index people_user_name_idx on public.people(user_id, name);
create index people_user_last_contacted_idx on public.people(user_id, last_contacted_at);

-- ---------- Interactions ----------

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  person_id uuid not null references public.people(id) on delete cascade,
  interaction_type text not null check (
    interaction_type in (
      'call',
      'text',
      'email',
      'in_person',
      'video',
      'other'
    )
  ),
  happened_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.interactions enable row level security;

create policy "Users can view their own interactions"
on public.interactions
for select
using (user_id = auth.uid());

create policy "Users can create their own interactions"
on public.interactions
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.people
    where people.id = interactions.person_id
      and people.user_id = auth.uid()
  )
);

create policy "Users can update their own interactions"
on public.interactions
for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.people
    where people.id = interactions.person_id
      and people.user_id = auth.uid()
  )
);

create policy "Users can delete their own interactions"
on public.interactions
for delete
using (user_id = auth.uid());

create index interactions_user_id_idx on public.interactions(user_id);
create index interactions_person_id_idx on public.interactions(person_id);
create index interactions_person_happened_at_idx on public.interactions(person_id, happened_at desc);

-- ---------- Reminders ----------

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  person_id uuid not null references public.people(id) on delete cascade,
  title text not null,
  remind_at timestamptz not null,
  status text not null default 'pending' check (
    status in ('pending', 'completed', 'dismissed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "Users can view their own reminders"
on public.reminders
for select
using (user_id = auth.uid());

create policy "Users can create their own reminders"
on public.reminders
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.people
    where people.id = reminders.person_id
      and people.user_id = auth.uid()
  )
);

create policy "Users can update their own reminders"
on public.reminders
for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.people
    where people.id = reminders.person_id
      and people.user_id = auth.uid()
  )
);

create policy "Users can delete their own reminders"
on public.reminders
for delete
using (user_id = auth.uid());

create trigger reminders_set_updated_at
before update on public.reminders
for each row
execute function public.set_updated_at();

create index reminders_user_id_idx on public.reminders(user_id);
create index reminders_person_id_idx on public.reminders(person_id);
create index reminders_user_status_remind_at_idx on public.reminders(user_id, status, remind_at);

-- ---------- Tags ----------

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.tags enable row level security;

create policy "Users can view their own tags"
on public.tags
for select
using (user_id = auth.uid());

create policy "Users can create their own tags"
on public.tags
for insert
with check (user_id = auth.uid());

create policy "Users can update their own tags"
on public.tags
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own tags"
on public.tags
for delete
using (user_id = auth.uid());

create trigger tags_set_updated_at
before update on public.tags
for each row
execute function public.set_updated_at();

create index tags_user_id_idx on public.tags(user_id);

-- ---------- Person Tags ----------

create table public.person_tags (
  person_id uuid not null references public.people(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (person_id, tag_id)
);

alter table public.person_tags enable row level security;

create policy "Users can view their own person tags"
on public.person_tags
for select
using (
  exists (
    select 1
    from public.people
    where people.id = person_tags.person_id
      and people.user_id = auth.uid()
  )
);

create policy "Users can create their own person tags"
on public.person_tags
for insert
with check (
  exists (
    select 1
    from public.people
    where people.id = person_tags.person_id
      and people.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tags
    where tags.id = person_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

create policy "Users can delete their own person tags"
on public.person_tags
for delete
using (
  exists (
    select 1
    from public.people
    where people.id = person_tags.person_id
      and people.user_id = auth.uid()
  )
);

create index person_tags_person_id_idx on public.person_tags(person_id);
create index person_tags_tag_id_idx on public.person_tags(tag_id);