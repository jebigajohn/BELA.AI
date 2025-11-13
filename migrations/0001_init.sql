-- 23 Nailroom – Initial schema
-- PostgreSQL (Supabase) migration

-- ===============
-- Enums
-- ===============
create type public.member_role as enum ('admin', 'staff');
create type public.appointment_status as enum ('requested', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');
create type public.message_sender as enum ('studio', 'customer', 'ai');
create type public.channel as enum ('instagram', 'internal');
create type public.thread_status as enum ('open', 'snoozed', 'closed');

-- ===============
-- Tables
-- ===============
-- studios (root table)
create table public.studios (
  id uuid primary key,
  name text not null,
  slug text not null unique,
  timezone text not null,
  default_currency char(3) not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- profiles (1:1 to auth.users)
create table public.profiles (
  id uuid primary key,
  full_name text not null,
  avatar_url text,
  phone text,
  default_studio_id uuid,
  created_at timestamptz not null default now()
);

-- studio_members
create table public.studio_members (
  studio_id uuid not null,
  profile_id uuid not null,
  role public.member_role not null,
  title text,
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  constraint studio_members_pkey primary key (studio_id, profile_id)
);

-- locations
create table public.locations (
  id uuid primary key,
  studio_id uuid not null,
  name text not null,
  address jsonb,
  phone text,
  constraint locations_uq_tenant_id unique (studio_id, id)
);

-- customers
create table public.customers (
  id uuid primary key,
  studio_id uuid not null,
  full_name text not null,
  phone text,
  email text,
  instagram_handle text,
  notes text,
  consent_marketing boolean not null default false,
  created_at timestamptz not null default now(),
  constraint customers_uq_tenant_id unique (studio_id, id)
);

-- services
create table public.services (
  id uuid primary key,
  studio_id uuid not null,
  name text not null,
  description text,
  category text,
  duration_min int not null,
  buffer_before_min int not null default 0,
  buffer_after_min int not null default 0,
  price_cents int not null,
  currency char(3) not null,
  color text,
  active boolean not null default true,
  constraint services_uq_tenant_id unique (studio_id, id),
  constraint services_uq_name_per_studio unique (studio_id, name)
);

-- staff
create table public.staff (
  id uuid primary key,
  studio_id uuid not null,
  profile_id uuid,
  display_name text not null,
  bio text,
  color text,
  is_bookable boolean not null default true,
  constraint staff_uq_tenant_id unique (studio_id, id)
);

-- staff_services (M:N)
create table public.staff_services (
  studio_id uuid not null,
  staff_id uuid not null,
  service_id uuid not null,
  price_cents int,
  duration_min int,
  active boolean not null default true,
  constraint staff_services_pkey primary key (studio_id, staff_id, service_id)
);

-- studio_hours
create table public.studio_hours (
  id uuid primary key,
  studio_id uuid not null,
  weekday int not null,
  open_time time not null,
  close_time time not null,
  constraint studio_hours_uq_slot unique (studio_id, weekday, open_time, close_time),
  constraint studio_hours_uq_tenant_id unique (studio_id, id)
);

-- staff_working_hours
create table public.staff_working_hours (
  id uuid primary key,
  studio_id uuid not null,
  staff_id uuid not null,
  weekday int not null,
  start_time time not null,
  end_time time not null,
  location_id uuid,
  constraint staff_working_hours_time_ok check (end_time > start_time),
  constraint staff_working_hours_uq_tenant_id unique (studio_id, id)
);

-- staff_time_off
create table public.staff_time_off (
  id uuid primary key,
  studio_id uuid not null,
  staff_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  constraint staff_time_off_time_ok check (ends_at > starts_at),
  constraint staff_time_off_uq_tenant_id unique (studio_id, id)
);

-- appointments
create table public.appointments (
  id uuid primary key,
  studio_id uuid not null,
  customer_id uuid not null,
  staff_id uuid not null,
  service_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'requested',
  price_cents int not null,
  currency char(3) not null,
  notes text,
  source text,
  created_by uuid not null,
  rescheduled_from_id uuid,
  constraint appointments_time_ok check (ends_at > starts_at),
  constraint appointments_uq_tenant_id unique (studio_id, id)
);

-- message_threads
create table public.message_threads (
  id uuid primary key,
  studio_id uuid not null,
  customer_id uuid not null,
  channel public.channel not null,
  external_ref text,
  status public.thread_status not null default 'open',
  last_message_at timestamptz,
  constraint message_threads_uq_tenant_id unique (studio_id, id)
);

-- messages
create table public.messages (
  id uuid primary key,
  studio_id uuid not null,
  thread_id uuid not null,
  sender_type public.message_sender not null,
  sender_profile_id uuid,
  content text not null,
  attachments jsonb,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  constraint messages_uq_tenant_id unique (studio_id, id)
);

-- ai_prompts
create table public.ai_prompts (
  id uuid primary key,
  studio_id uuid not null,
  key text not null,
  content text not null,
  is_active boolean not null default true,
  constraint ai_prompts_uq_tenant_id unique (studio_id, id),
  constraint ai_prompts_uq_key_per_studio unique (studio_id, key)
);

-- ai_suggestions
create table public.ai_suggestions (
  id uuid primary key,
  studio_id uuid not null,
  suggestion_type text not null,
  message_id uuid,
  appointment_id uuid,
  payload jsonb,
  content text,
  score numeric,
  constraint ai_suggestions_uq_tenant_id unique (studio_id, id)
);

-- audit_logs
create table public.audit_logs (
  id bigint generated by default as identity primary key,
  studio_id uuid not null,
  actor_profile_id uuid,
  action text not null,
  object_type text not null,
  object_id uuid,
  changes jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ===============
-- Foreign Keys (added after table creation to avoid cycles)
-- ===============
-- profiles ↔ auth.users and studios
alter table public.profiles
  add constraint profiles_id_fk_auth_users foreign key (id) references auth.users(id),
  add constraint profiles_default_studio_fk foreign key (default_studio_id) references public.studios(id);

-- studios.created_by → profiles.id
alter table public.studios
  add constraint studios_created_by_fk foreign key (created_by) references public.profiles(id);

-- studio_members
alter table public.studio_members
  add constraint studio_members_studio_fk foreign key (studio_id) references public.studios(id),
  add constraint studio_members_profile_fk foreign key (profile_id) references public.profiles(id);

-- locations
alter table public.locations
  add constraint locations_studio_fk foreign key (studio_id) references public.studios(id);

-- customers
alter table public.customers
  add constraint customers_studio_fk foreign key (studio_id) references public.studios(id);

-- services
alter table public.services
  add constraint services_studio_fk foreign key (studio_id) references public.studios(id);

-- staff
alter table public.staff
  add constraint staff_studio_fk foreign key (studio_id) references public.studios(id),
  add constraint staff_profile_fk foreign key (profile_id) references public.profiles(id);

-- staff_services (composite FKs)
alter table public.staff_services
  add constraint staff_services_staff_fk foreign key (studio_id, staff_id) references public.staff(studio_id, id),
  add constraint staff_services_service_fk foreign key (studio_id, service_id) references public.services(studio_id, id);

-- studio_hours
alter table public.studio_hours
  add constraint studio_hours_studio_fk foreign key (studio_id) references public.studios(id);

-- staff_working_hours
alter table public.staff_working_hours
  add constraint staff_working_hours_staff_fk foreign key (studio_id, staff_id) references public.staff(studio_id, id),
  add constraint staff_working_hours_location_fk foreign key (studio_id, location_id) references public.locations(studio_id, id);

-- staff_time_off
alter table public.staff_time_off
  add constraint staff_time_off_staff_fk foreign key (studio_id, staff_id) references public.staff(studio_id, id);

-- appointments
alter table public.appointments
  add constraint appointments_customer_fk foreign key (studio_id, customer_id) references public.customers(studio_id, id),
  add constraint appointments_staff_fk foreign key (studio_id, staff_id) references public.staff(studio_id, id),
  add constraint appointments_service_fk foreign key (studio_id, service_id) references public.services(studio_id, id),
  add constraint appointments_created_by_fk foreign key (created_by) references public.profiles(id),
  add constraint appointments_rescheduled_from_fk foreign key (studio_id, rescheduled_from_id) references public.appointments(studio_id, id);

-- message_threads
alter table public.message_threads
  add constraint message_threads_customer_fk foreign key (studio_id, customer_id) references public.customers(studio_id, id);

-- messages
alter table public.messages
  add constraint messages_thread_fk foreign key (studio_id, thread_id) references public.message_threads(studio_id, id),
  add constraint messages_sender_profile_fk foreign key (sender_profile_id) references public.profiles(id);

-- ai_prompts
alter table public.ai_prompts
  add constraint ai_prompts_studio_fk foreign key (studio_id) references public.studios(id);

-- ai_suggestions
alter table public.ai_suggestions
  add constraint ai_suggestions_message_fk foreign key (studio_id, message_id) references public.messages(studio_id, id),
  add constraint ai_suggestions_appointment_fk foreign key (studio_id, appointment_id) references public.appointments(studio_id, id);

-- audit_logs
alter table public.audit_logs
  add constraint audit_logs_studio_fk foreign key (studio_id) references public.studios(id),
  add constraint audit_logs_actor_profile_fk foreign key (actor_profile_id) references public.profiles(id);

-- ===============
-- Unique and partial unique constraints not expressible inline
-- ===============
-- customers: unique phone/email per studio, treating NULLs as equal
alter table public.customers
  add constraint customers_uq_phone_per_studio unique nulls not distinct (studio_id, phone),
  add constraint customers_uq_email_per_studio unique nulls not distinct (studio_id, email);

-- staff: unique (studio_id, profile_id) when profile_id is not null
create unique index staff_uq_profile_per_studio on public.staff (studio_id, profile_id) where profile_id is not null;

-- ===============
-- Indexes
-- ===============
-- Generic tenant index on all multi-tenant tables
create index idx_studio_members_studio_id on public.studio_members (studio_id);
create index idx_locations_studio_id on public.locations (studio_id);
create index idx_customers_studio_id on public.customers (studio_id);
create index idx_services_studio_id on public.services (studio_id);
create index idx_staff_studio_id on public.staff (studio_id);
create index idx_staff_services_studio_id on public.staff_services (studio_id);
create index idx_studio_hours_studio_id on public.studio_hours (studio_id);
create index idx_staff_working_hours_studio_id on public.staff_working_hours (studio_id);
create index idx_staff_time_off_studio_id on public.staff_time_off (studio_id);
create index idx_appointments_studio_id on public.appointments (studio_id);
create index idx_message_threads_studio_id on public.message_threads (studio_id);
create index idx_messages_studio_id on public.messages (studio_id);
create index idx_ai_prompts_studio_id on public.ai_prompts (studio_id);
create index idx_ai_suggestions_studio_id on public.ai_suggestions (studio_id);
create index idx_audit_logs_studio_id on public.audit_logs (studio_id);

-- Specific additional indexes
-- studio_members
create index idx_studio_members_profile_id on public.studio_members (profile_id);

-- profiles
create index idx_profiles_default_studio_id on public.profiles (default_studio_id);

-- services: name uniqueness already enforced; no extra index needed beyond unique

-- appointments critical indexes
create index idx_appointments_starts_at on public.appointments (studio_id, starts_at);
create index idx_appointments_staff_starts_at on public.appointments (studio_id, staff_id, starts_at);
create index idx_appointments_customer_starts_at on public.appointments (studio_id, customer_id, starts_at);

-- messages critical index
create index idx_messages_thread_sent_at_desc on public.messages (studio_id, thread_id, sent_at desc);
