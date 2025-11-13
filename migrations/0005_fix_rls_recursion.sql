-- Fix RLS infinite recursion by using SECURITY DEFINER helper functions
-- and rewriting policies to use those helpers instead of self-referencing queries.

-- Helper functions
create or replace function public.is_member(p_studio_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.studio_members m
    where m.studio_id = p_studio_id
      and m.profile_id = auth.uid()
      and m.is_active = true
  );
$$;

create or replace function public.is_admin(p_studio_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.studio_members m
    where m.studio_id = p_studio_id
      and m.profile_id = auth.uid()
      and m.is_active = true
      and m.role = 'admin'
  );
$$;

-- Allow all roles to execute these helpers (evaluation happens under user role)
grant execute on function public.is_member(uuid) to public;
grant execute on function public.is_admin(uuid) to public;

-- Recreate policies to use helpers

-- studio_members
drop policy if exists studio_members_select on public.studio_members;
drop policy if exists studio_members_insert_admin on public.studio_members;
drop policy if exists studio_members_update_admin on public.studio_members;
drop policy if exists studio_members_delete_admin on public.studio_members;
create policy studio_members_select on public.studio_members for select using (public.is_member(studio_id));
create policy studio_members_insert_admin on public.studio_members for insert with check (public.is_admin(studio_id));
create policy studio_members_update_admin on public.studio_members for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy studio_members_delete_admin on public.studio_members for delete using (public.is_admin(studio_id));

-- locations
drop policy if exists locations_select on public.locations;
drop policy if exists locations_insert_admin on public.locations;
drop policy if exists locations_update_admin on public.locations;
drop policy if exists locations_delete_admin on public.locations;
create policy locations_select on public.locations for select using (public.is_member(studio_id));
create policy locations_insert_admin on public.locations for insert with check (public.is_admin(studio_id));
create policy locations_update_admin on public.locations for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy locations_delete_admin on public.locations for delete using (public.is_admin(studio_id));

-- customers
drop policy if exists customers_select on public.customers;
drop policy if exists customers_insert_staff_or_admin on public.customers;
drop policy if exists customers_update_staff_or_admin on public.customers;
drop policy if exists customers_delete_admin on public.customers;
create policy customers_select on public.customers for select using (public.is_member(studio_id));
create policy customers_insert_staff_or_admin on public.customers for insert with check (public.is_member(studio_id));
create policy customers_update_staff_or_admin on public.customers for update using (public.is_member(studio_id)) with check (public.is_member(studio_id));
create policy customers_delete_admin on public.customers for delete using (public.is_admin(studio_id));

-- services
drop policy if exists services_select on public.services;
drop policy if exists services_insert_admin on public.services;
drop policy if exists services_update_admin on public.services;
drop policy if exists services_delete_admin on public.services;
create policy services_select on public.services for select using (public.is_member(studio_id));
create policy services_insert_admin on public.services for insert with check (public.is_admin(studio_id));
create policy services_update_admin on public.services for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy services_delete_admin on public.services for delete using (public.is_admin(studio_id));

-- staff
drop policy if exists staff_select on public.staff;
drop policy if exists staff_insert_admin on public.staff;
drop policy if exists staff_update_admin on public.staff;
drop policy if exists staff_delete_admin on public.staff;
create policy staff_select on public.staff for select using (public.is_member(studio_id));
create policy staff_insert_admin on public.staff for insert with check (public.is_admin(studio_id));
create policy staff_update_admin on public.staff for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy staff_delete_admin on public.staff for delete using (public.is_admin(studio_id));

-- staff_services
drop policy if exists staff_services_select on public.staff_services;
drop policy if exists staff_services_insert_admin on public.staff_services;
drop policy if exists staff_services_update_admin on public.staff_services;
drop policy if exists staff_services_delete_admin on public.staff_services;
create policy staff_services_select on public.staff_services for select using (public.is_member(studio_id));
create policy staff_services_insert_admin on public.staff_services for insert with check (public.is_admin(studio_id));
create policy staff_services_update_admin on public.staff_services for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy staff_services_delete_admin on public.staff_services for delete using (public.is_admin(studio_id));

-- studio_hours
drop policy if exists studio_hours_select on public.studio_hours;
drop policy if exists studio_hours_insert_admin on public.studio_hours;
drop policy if exists studio_hours_update_admin on public.studio_hours;
drop policy if exists studio_hours_delete_admin on public.studio_hours;
create policy studio_hours_select on public.studio_hours for select using (public.is_member(studio_id));
create policy studio_hours_insert_admin on public.studio_hours for insert with check (public.is_admin(studio_id));
create policy studio_hours_update_admin on public.studio_hours for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy studio_hours_delete_admin on public.studio_hours for delete using (public.is_admin(studio_id));

-- staff_working_hours
drop policy if exists staff_working_hours_select on public.staff_working_hours;
drop policy if exists staff_working_hours_insert_admin on public.staff_working_hours;
drop policy if exists staff_working_hours_update_admin on public.staff_working_hours;
drop policy if exists staff_working_hours_delete_admin on public.staff_working_hours;
create policy staff_working_hours_select on public.staff_working_hours for select using (public.is_member(studio_id));
create policy staff_working_hours_insert_admin on public.staff_working_hours for insert with check (public.is_admin(studio_id));
create policy staff_working_hours_update_admin on public.staff_working_hours for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy staff_working_hours_delete_admin on public.staff_working_hours for delete using (public.is_admin(studio_id));

-- staff_time_off
drop policy if exists staff_time_off_select on public.staff_time_off;
drop policy if exists staff_time_off_insert_admin on public.staff_time_off;
drop policy if exists staff_time_off_update_admin on public.staff_time_off;
drop policy if exists staff_time_off_delete_admin on public.staff_time_off;
create policy staff_time_off_select on public.staff_time_off for select using (public.is_member(studio_id));
create policy staff_time_off_insert_admin on public.staff_time_off for insert with check (public.is_admin(studio_id));
create policy staff_time_off_update_admin on public.staff_time_off for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy staff_time_off_delete_admin on public.staff_time_off for delete using (public.is_admin(studio_id));

-- appointments
drop policy if exists appointments_select on public.appointments;
drop policy if exists appointments_insert_member on public.appointments;
drop policy if exists appointments_update_admin on public.appointments;
drop policy if exists appointments_update_staff_own on public.appointments;
drop policy if exists appointments_delete_admin on public.appointments;
create policy appointments_select on public.appointments for select using (public.is_member(studio_id));
create policy appointments_insert_member on public.appointments for insert with check (public.is_member(studio_id));
create policy appointments_update_admin on public.appointments for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy appointments_update_staff_own on public.appointments for update using (
  public.is_member(studio_id) and (
    exists (
      select 1 from public.staff s
      where s.studio_id = appointments.studio_id
        and s.id = appointments.staff_id
        and s.profile_id = auth.uid()
    )
    or appointments.created_by = auth.uid()
  )
) with check (
  public.is_member(studio_id) and (
    exists (
      select 1 from public.staff s
      where s.studio_id = appointments.studio_id
        and s.id = appointments.staff_id
        and s.profile_id = auth.uid()
    )
    or appointments.created_by = auth.uid()
  )
);
create policy appointments_delete_admin on public.appointments for delete using (public.is_admin(studio_id));

-- message_threads
drop policy if exists message_threads_select on public.message_threads;
drop policy if exists message_threads_insert_member on public.message_threads;
drop policy if exists message_threads_update_admin on public.message_threads;
drop policy if exists message_threads_delete_admin on public.message_threads;
create policy message_threads_select on public.message_threads for select using (public.is_member(studio_id));
create policy message_threads_insert_member on public.message_threads for insert with check (public.is_member(studio_id));
create policy message_threads_update_admin on public.message_threads for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy message_threads_delete_admin on public.message_threads for delete using (public.is_admin(studio_id));

-- messages
drop policy if exists messages_select on public.messages;
drop policy if exists messages_insert_member on public.messages;
drop policy if exists messages_update_admin on public.messages;
drop policy if exists messages_delete_admin on public.messages;
create policy messages_select on public.messages for select using (public.is_member(studio_id));
create policy messages_insert_member on public.messages for insert with check (public.is_member(studio_id));
create policy messages_update_admin on public.messages for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy messages_delete_admin on public.messages for delete using (public.is_admin(studio_id));

-- ai_prompts
drop policy if exists ai_prompts_select on public.ai_prompts;
drop policy if exists ai_prompts_insert_admin on public.ai_prompts;
drop policy if exists ai_prompts_update_admin on public.ai_prompts;
drop policy if exists ai_prompts_delete_admin on public.ai_prompts;
create policy ai_prompts_select on public.ai_prompts for select using (public.is_member(studio_id));
create policy ai_prompts_insert_admin on public.ai_prompts for insert with check (public.is_admin(studio_id));
create policy ai_prompts_update_admin on public.ai_prompts for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy ai_prompts_delete_admin on public.ai_prompts for delete using (public.is_admin(studio_id));

-- ai_suggestions
drop policy if exists ai_suggestions_select on public.ai_suggestions;
drop policy if exists ai_suggestions_insert_member on public.ai_suggestions;
drop policy if exists ai_suggestions_update_admin on public.ai_suggestions;
drop policy if exists ai_suggestions_delete_admin on public.ai_suggestions;
create policy ai_suggestions_select on public.ai_suggestions for select using (public.is_member(studio_id));
create policy ai_suggestions_insert_member on public.ai_suggestions for insert with check (public.is_member(studio_id));
create policy ai_suggestions_update_admin on public.ai_suggestions for update using (public.is_admin(studio_id)) with check (public.is_admin(studio_id));
create policy ai_suggestions_delete_admin on public.ai_suggestions for delete using (public.is_admin(studio_id));

-- audit_logs
drop policy if exists audit_logs_select_admin on public.audit_logs;
drop policy if exists audit_logs_insert_any on public.audit_logs;
create policy audit_logs_select_admin on public.audit_logs for select using (public.is_admin(studio_id));
create policy audit_logs_insert_any on public.audit_logs for insert with check (true);
