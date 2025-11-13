-- 23 Nailroom – RLS policies
-- Strikte Tenant-Isolation per studio_id und Rollen admin|staff via public.studio_members
--
-- Hilfsbedingung (Pattern):
--  Mitgliedschaft (sichtbar/bearbeitbar):
--    EXISTS (
--      SELECT 1 FROM public.studio_members m
--      WHERE m.studio_id = <row>.studio_id
--        AND m.profile_id = auth.uid()
--        AND m.is_active = true
--    )
--  Admin-only zusätzlich:
--    AND m.role = 'admin'

-- =========================
-- profiles
-- =========================
alter table public.profiles enable row level security;

-- Nur der eingeloggte Nutzer sieht/bearbeitet sein Profil
create policy profiles_self_select on public.profiles
  for select
  using (id = auth.uid());

create policy profiles_self_update on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Kein DELETE/INSERT nötig (Insert via Trigger, Delete nur durch Superuser)

-- =========================
-- studio_members
-- =========================
alter table public.studio_members enable row level security;

-- SELECT: alle Members des Studios, in dem der User Mitglied ist
create policy studio_members_select on public.studio_members
  for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_members.studio_id
        and m.profile_id = auth.uid()
        and m.is_active = true
    )
  );

-- INSERT: nur admin im Ziel-Studio
create policy studio_members_insert_admin on public.studio_members
  for insert
  with check (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_members.studio_id
        and m.profile_id = auth.uid()
        and m.is_active = true
        and m.role = 'admin'
    )
  );

-- UPDATE: nur admin (auf Basis der alten und neuen Zeile)
create policy studio_members_update_admin on public.studio_members
  for update
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_members.studio_id
        and m.profile_id = auth.uid()
        and m.is_active = true
        and m.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_members.studio_id
        and m.profile_id = auth.uid()
        and m.is_active = true
        and m.role = 'admin'
    )
  );

-- DELETE: nur admin
create policy studio_members_delete_admin on public.studio_members
  for delete
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_members.studio_id
        and m.profile_id = auth.uid()
        and m.is_active = true
        and m.role = 'admin'
    )
  );

-- =========================
-- Helper macros in comments used below:
--   MEMBER_USING(<tbl>) = exists (select 1 from public.studio_members m where m.studio_id = <tbl>.studio_id and m.profile_id = auth.uid() and m.is_active)
--   ADMIN_USING(<tbl>)  = exists (select 1 from public.studio_members m where m.studio_id = <tbl>.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')

-- =========================
-- locations
-- =========================
alter table public.locations enable row level security;
create policy locations_select on public.locations for select using (
  exists (select 1 from public.studio_members m where m.studio_id = locations.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy locations_insert_admin on public.locations for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = locations.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy locations_update_admin on public.locations for update using (
  exists (select 1 from public.studio_members m where m.studio_id = locations.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = locations.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy locations_delete_admin on public.locations for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = locations.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- customers
-- =========================
alter table public.customers enable row level security;
create policy customers_select on public.customers for select using (
  exists (select 1 from public.studio_members m where m.studio_id = customers.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy customers_insert_staff_or_admin on public.customers for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = customers.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy customers_update_staff_or_admin on public.customers for update using (
  exists (select 1 from public.studio_members m where m.studio_id = customers.studio_id and m.profile_id = auth.uid() and m.is_active)
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = customers.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy customers_delete_admin on public.customers for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = customers.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- services
-- =========================
alter table public.services enable row level security;
create policy services_select on public.services for select using (
  exists (select 1 from public.studio_members m where m.studio_id = services.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy services_insert_admin on public.services for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy services_update_admin on public.services for update using (
  exists (select 1 from public.studio_members m where m.studio_id = services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy services_delete_admin on public.services for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- staff
-- =========================
alter table public.staff enable row level security;
create policy staff_select on public.staff for select using (
  exists (select 1 from public.studio_members m where m.studio_id = staff.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy staff_insert_admin on public.staff for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_update_admin on public.staff for update using (
  exists (select 1 from public.studio_members m where m.studio_id = staff.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_delete_admin on public.staff for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = staff.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- staff_services
-- =========================
alter table public.staff_services enable row level security;
create policy staff_services_select on public.staff_services for select using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_services.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy staff_services_insert_admin on public.staff_services for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff_services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_services_update_admin on public.staff_services for update using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff_services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_services_delete_admin on public.staff_services for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_services.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- studio_hours
-- =========================
alter table public.studio_hours enable row level security;
create policy studio_hours_select on public.studio_hours for select using (
  exists (select 1 from public.studio_members m where m.studio_id = studio_hours.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy studio_hours_insert_admin on public.studio_hours for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = studio_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy studio_hours_update_admin on public.studio_hours for update using (
  exists (select 1 from public.studio_members m where m.studio_id = studio_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = studio_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy studio_hours_delete_admin on public.studio_hours for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = studio_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- staff_working_hours
-- =========================
alter table public.staff_working_hours enable row level security;
create policy staff_working_hours_select on public.staff_working_hours for select using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_working_hours.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy staff_working_hours_insert_admin on public.staff_working_hours for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff_working_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_working_hours_update_admin on public.staff_working_hours for update using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_working_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff_working_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_working_hours_delete_admin on public.staff_working_hours for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_working_hours.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- staff_time_off
-- =========================
alter table public.staff_time_off enable row level security;
create policy staff_time_off_select on public.staff_time_off for select using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_time_off.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy staff_time_off_insert_admin on public.staff_time_off for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff_time_off.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_time_off_update_admin on public.staff_time_off for update using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_time_off.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = staff_time_off.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy staff_time_off_delete_admin on public.staff_time_off for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = staff_time_off.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- appointments
-- =========================
alter table public.appointments enable row level security;

-- SELECT: alle Members
create policy appointments_select on public.appointments for select using (
  exists (select 1 from public.studio_members m where m.studio_id = appointments.studio_id and m.profile_id = auth.uid() and m.is_active)
);

-- INSERT: staff & admin
create policy appointments_insert_member on public.appointments for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = appointments.studio_id and m.profile_id = auth.uid() and m.is_active)
);

-- UPDATE: admin full access
create policy appointments_update_admin on public.appointments for update using (
  exists (select 1 from public.studio_members m where m.studio_id = appointments.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = appointments.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- UPDATE: staff darf eigene Termine (staff_id gehört zu eigenem profile) ODER vom User erstellte Termine
create policy appointments_update_staff_own on public.appointments for update using (
  exists (select 1 from public.studio_members m where m.studio_id = appointments.studio_id and m.profile_id = auth.uid() and m.is_active and m.role in ('admin','staff'))
  and (
    exists (
      select 1 from public.staff s
      where s.studio_id = appointments.studio_id
        and s.id = appointments.staff_id
        and s.profile_id = auth.uid()
    )
    or appointments.created_by = auth.uid()
  )
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = appointments.studio_id and m.profile_id = auth.uid() and m.is_active and m.role in ('admin','staff'))
  and (
    exists (
      select 1 from public.staff s
      where s.studio_id = appointments.studio_id
        and s.id = appointments.staff_id
        and s.profile_id = auth.uid()
    )
    or appointments.created_by = auth.uid()
  )
);

-- DELETE: nur admin
create policy appointments_delete_admin on public.appointments for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = appointments.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- message_threads
-- =========================
alter table public.message_threads enable row level security;
create policy message_threads_select on public.message_threads for select using (
  exists (select 1 from public.studio_members m where m.studio_id = message_threads.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy message_threads_insert_member on public.message_threads for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = message_threads.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy message_threads_update_admin on public.message_threads for update using (
  exists (select 1 from public.studio_members m where m.studio_id = message_threads.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = message_threads.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy message_threads_delete_admin on public.message_threads for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = message_threads.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- messages
-- =========================
alter table public.messages enable row level security;
create policy messages_select on public.messages for select using (
  exists (select 1 from public.studio_members m where m.studio_id = messages.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy messages_insert_member on public.messages for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = messages.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy messages_update_admin on public.messages for update using (
  exists (select 1 from public.studio_members m where m.studio_id = messages.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = messages.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy messages_delete_admin on public.messages for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = messages.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- ai_prompts
-- =========================
alter table public.ai_prompts enable row level security;
create policy ai_prompts_select on public.ai_prompts for select using (
  exists (select 1 from public.studio_members m where m.studio_id = ai_prompts.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy ai_prompts_insert_admin on public.ai_prompts for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = ai_prompts.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy ai_prompts_update_admin on public.ai_prompts for update using (
  exists (select 1 from public.studio_members m where m.studio_id = ai_prompts.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = ai_prompts.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy ai_prompts_delete_admin on public.ai_prompts for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = ai_prompts.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- ai_suggestions
-- =========================
alter table public.ai_suggestions enable row level security;
create policy ai_suggestions_select on public.ai_suggestions for select using (
  exists (select 1 from public.studio_members m where m.studio_id = ai_suggestions.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy ai_suggestions_insert_member on public.ai_suggestions for insert with check (
  exists (select 1 from public.studio_members m where m.studio_id = ai_suggestions.studio_id and m.profile_id = auth.uid() and m.is_active)
);
create policy ai_suggestions_update_admin on public.ai_suggestions for update using (
  exists (select 1 from public.studio_members m where m.studio_id = ai_suggestions.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
) with check (
  exists (select 1 from public.studio_members m where m.studio_id = ai_suggestions.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);
create policy ai_suggestions_delete_admin on public.ai_suggestions for delete using (
  exists (select 1 from public.studio_members m where m.studio_id = ai_suggestions.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- =========================
-- audit_logs
-- =========================
alter table public.audit_logs enable row level security;

-- SELECT: nur admin
delete from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'audit_logs_select_admin'; -- idempotency
create policy audit_logs_select_admin on public.audit_logs for select using (
  exists (select 1 from public.studio_members m where m.studio_id = audit_logs.studio_id and m.profile_id = auth.uid() and m.is_active and m.role='admin')
);

-- INSERT: systemseitig (ohne Einschränkung nötig)
create policy audit_logs_insert_any on public.audit_logs for insert with check (true);

-- UPDATE/DELETE: niemand (kein Policy => verboten)

-- =========================
-- Beispiele zum Testen (nur als Kommentar)
-- =========================
-- Beispiel SELECT (appointments):
--   select * from public.appointments
--   where studio_id = '<some-tenant-uuid>'::uuid
--   order by starts_at desc
--   limit 5;
--
-- Beispiel INSERT (appointments):
--   insert into public.appointments (
--     id, studio_id, customer_id, staff_id, service_id, starts_at, ends_at,
--     status, price_cents, currency, created_by
--   ) values (
--     gen_random_uuid(), '<studio-uuid>'::uuid, '<customer-uuid>'::uuid, '<staff-uuid>'::uuid,
--     '<service-uuid>'::uuid, now() + interval '1 day', now() + interval '1 day' + interval '1 hour',
--     'requested', 5000, 'EUR', auth.uid()
--   );
