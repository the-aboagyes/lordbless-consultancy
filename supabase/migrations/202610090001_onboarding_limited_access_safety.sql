-- Onboarding safety correction.
--
-- This migration is additive and assumes the identity foundation migration
-- has been applied. It deliberately does not implement Finance activation:
-- the repository contains no authoritative payment tables or policies to
-- validate the qualifying payment against.

do $$
begin
    if to_regprocedure('public.activate_client_account()') is null then
        raise exception 'Required function public.activate_client_account() is missing; apply the identity foundation first.';
    end if;

    if not exists (
        select 1
        from pg_catalog.pg_attribute a
        join pg_catalog.pg_class c on c.oid = a.attrelid
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'auth'
          and c.relname = 'users'
          and a.attname = 'encrypted_password'
          and a.attnum > 0
          and not a.attisdropped
    ) then
        raise exception 'Supabase Auth auth.users.encrypted_password is unavailable; verify the Auth schema before applying onboarding setup.';
    end if;
end;
$$;

-- Remove the email-confirmation-only route to full access.
revoke all on function public.activate_client_account()
    from public, anon, authenticated;

-- Client account status is changed only by trusted security-definer paths.
-- The authenticated role retains the self/staff-scoped SELECT policy below
-- but cannot write account links or lifecycle state directly.
revoke all on table public.client_accounts from anon, authenticated;
grant select on table public.client_accounts to authenticated;

create or replace function private.current_limited_client_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
    select ca.client_id
    from public.client_accounts ca
    where ca.auth_user_id = auth.uid()
      and ca.access_status = 'activation_required'
    limit 1;
$$;

revoke all on function private.current_limited_client_id() from public, anon;
grant execute on function private.current_limited_client_id() to authenticated;

-- Limited clients can read their own profile only. Existing active-only
-- policies for documents, journeys and other full-access data are unchanged.
drop policy if exists clients_read_own_limited_profile on public.clients;
create policy clients_read_own_limited_profile
on public.clients for select to authenticated
using (private.current_limited_client_id() = id);

create or replace function public.complete_client_password_setup()
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
    linked_status text;
begin
    if auth.uid() is null then
        raise exception 'Authentication is required.' using errcode = '42501';
    end if;

    select ca.access_status
    into linked_status
    from public.client_accounts ca
    where ca.auth_user_id = auth.uid()
    for update;

    if linked_status is null then
        raise exception 'No client portal account is linked to this user.' using errcode = '42501';
    end if;

    if linked_status = 'invited' then
        if not exists (
            select 1
            from auth.users au
            where au.id = auth.uid()
              and au.email_confirmed_at is not null
              and nullif(au.encrypted_password, '') is not null
        ) then
            raise exception 'Confirm the invited email and set a password before continuing.' using errcode = '42501';
        end if;

        update public.client_accounts ca
        set access_status = 'activation_required',
            updated_at = now()
        where ca.auth_user_id = auth.uid()
          and ca.access_status = 'invited'
        returning ca.access_status into linked_status;
    end if;

    if linked_status not in ('activation_required', 'active') then
        raise exception 'This client portal account is restricted.' using errcode = '42501';
    end if;

    return linked_status;
end;
$$;

revoke all on function public.complete_client_password_setup() from public, anon;
grant execute on function public.complete_client_password_setup() to authenticated;
