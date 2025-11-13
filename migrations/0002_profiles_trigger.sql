-- 23 Nailroom – profiles auto-provision on signup
-- Function and trigger to create a public.profiles row after a new auth.users row is inserted

-- Create or replace function in public schema
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    phone,
    default_studio_id,
    created_at
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone',
    null,
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger on auth.users (after insert)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
