-- Parents Market 971 - Schema Supabase
-- A exécuter dans Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- PROFILS UTILISATEURS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  full_name text,
  email text,
  phone text,
  commune text,
  etablissement text,
  role text default 'parent' check (role in ('parent', 'admin')),
  whatsapp_optin boolean default false,
  rgpd_accepted boolean default false,
  marketing_optin boolean default false
);

alter table public.profiles enable row level security;

create policy "profiles_read_own"
on public.profiles for select
using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- CATEGORIES
create table if not exists public.categories (
  id bigserial primary key,
  name text not null unique,
  icon text,
  color text,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "categories_public_read"
on public.categories for select
using (true);

create policy "categories_admin_write"
on public.categories for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.categories (name, icon, color) values
('Livres scolaires', 'book', 'green'),
('Uniformes & Vêtements', 'shirt', 'blue'),
('Fournitures scolaires', 'bag', 'yellow'),
('Matériel électronique', 'calculator', 'purple'),
('Équipements sportifs', 'ball', 'pink'),
('Autres', 'dots', 'orange')
on conflict (name) do nothing;

-- ETABLISSEMENTS
create table if not exists public.etablissements (
  id bigserial primary key,
  name text not null,
  commune text not null,
  type text,
  created_at timestamptz default now()
);

alter table public.etablissements enable row level security;

create policy "etablissements_public_read"
on public.etablissements for select
using (true);

create policy "etablissements_admin_write"
on public.etablissements for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.etablissements (name, commune, type) values
('Collège de Baimbridge', 'Les Abymes', 'Collège'),
('Lycée Gerville Réache', 'Basse-Terre', 'Lycée'),
('Collège Matéliane', 'Gosier', 'Collège'),
('Collège Félix Éboué', 'Morne-à-l’Eau', 'Collège')
on conflict do nothing;

-- ANNONCES
create table if not exists public.annonces (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric,
  price_label text,
  category_id bigint references public.categories(id),
  commune text,
  etablissement text,
  photo_url text,
  status text default 'pending' check (status in ('pending', 'published', 'rejected', 'archived')),
  annonce_type text default 'sell' check (annonce_type in ('sell', 'donate', 'search'))
);

alter table public.annonces enable row level security;

create policy "annonces_public_published_read"
on public.annonces for select
using (
  status = 'published'
  or auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "annonces_insert_own"
on public.annonces for insert
with check (auth.uid() = user_id);

create policy "annonces_update_own_pending"
on public.annonces for update
using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "annonces_delete_admin_or_owner"
on public.annonces for delete
using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- MESSAGES INTERNES
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  annonce_id uuid references public.annonces(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz
);

alter table public.messages enable row level security;

create policy "messages_participants_read"
on public.messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "messages_sender_insert"
on public.messages for insert
with check (auth.uid() = sender_id);

-- SIGNALEMENTS
create table if not exists public.signalements (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  annonce_id uuid references public.annonces(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  status text default 'open' check (status in ('open', 'closed'))
);

alter table public.signalements enable row level security;

create policy "signalements_insert_logged"
on public.signalements for insert
with check (auth.uid() = reporter_id);

create policy "signalements_admin_read"
on public.signalements for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- CONSENTEMENTS RGPD
create table if not exists public.consents (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references public.profiles(id) on delete cascade,
  consent_type text not null,
  accepted boolean not null,
  version text default 'v1'
);

alter table public.consents enable row level security;

create policy "consents_own_read"
on public.consents for select
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "consents_own_insert"
on public.consents for insert
with check (auth.uid() = user_id);

-- TRIGGER CREATION PROFIL
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
