-- LORDBLESS identity, role, permission, desk, and client ownership foundation.
-- This migration intentionally does not change public.enquiries because its
-- client/desk ownership column was not confirmed.

create schema if not exists private;

create table public.staff_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default '',
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.staff_role_catalog (
    role_code text primary key,
    display_name text not null,
    description text not null default '',
    created_at timestamptz not null default now()
);

create table public.staff_roles (
    user_id uuid not null references public.staff_profiles(user_id) on delete cascade,
    role_code text not null references public.staff_role_catalog(role_code) on delete restrict,
    is_primary boolean not null default false,
    created_at timestamptz not null default now(),
    primary key (user_id, role_code)
);

create unique index staff_roles_one_primary_per_user
    on public.staff_roles (user_id)
    where is_primary;

create table public.permissions (
    permission_code text primary key,
    description text not null default '',
    created_at timestamptz not null default now()
);

create table public.role_permissions (
    role_code text not null references public.staff_role_catalog(role_code) on delete cascade,
    permission_code text not null references public.permissions(permission_code) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (role_code, permission_code)
);

create table public.staff_permissions (
    user_id uuid not null references public.staff_profiles(user_id) on delete cascade,
    permission_code text not null references public.permissions(permission_code) on delete cascade,
    granted_by uuid references public.staff_profiles(user_id) on delete set null,
    created_at timestamptz not null default now(),
    primary key (user_id, permission_code)
);

create table public.desks (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name text not null,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.staff_desks (
    user_id uuid not null references public.staff_profiles(user_id) on delete cascade,
    desk_id uuid not null references public.desks(id) on delete restrict,
    assigned_by uuid references public.staff_profiles(user_id) on delete set null,
    assigned_at timestamptz not null default now(),
    primary key (user_id, desk_id)
);

-- Clients can have explicit route/desk assignments without adding an
-- unverified desk column to public.clients.
create table public.client_desk_assignments (
    client_id uuid not null references public.clients(id) on delete cascade,
    desk_id uuid not null references public.desks(id) on delete restrict,
    assigned_by uuid references public.staff_profiles(user_id) on delete set null,
    assigned_at timestamptz not null default now(),
    primary key (client_id, desk_id)
);

create table public.client_accounts (
    auth_user_id uuid primary key references auth.users(id) on delete cascade,
    client_id uuid not null unique references public.clients(id) on delete cascade,
    access_status text not null default 'invited'
        check (access_status in (
            'invited',
            'activation_required',
            'active',
            'suspended',
            'closed'
        )),
    invited_at timestamptz,
    activated_at timestamptz,
    suspended_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function private.enforce_separate_identity_classes()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
    target_user_id uuid;
begin
    if tg_table_name = 'staff_profiles' then
        target_user_id := new.user_id;
    else
        target_user_id := new.auth_user_id;
    end if;

    perform pg_advisory_xact_lock(hashtextextended(target_user_id::text, 0));

    if tg_table_name = 'staff_profiles' and exists (
        select 1 from public.client_accounts ca
        where ca.auth_user_id = target_user_id
    ) then
        raise exception 'An Auth user cannot be both a client and internal staff member.'
            using errcode = '23514';
    end if;

    if tg_table_name = 'client_accounts' and exists (
        select 1 from public.staff_profiles sp
        where sp.user_id = target_user_id
    ) then
        raise exception 'An Auth user cannot be both a client and internal staff member.'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger staff_profiles_separate_identity_classes
before insert or update of user_id on public.staff_profiles
for each row execute function private.enforce_separate_identity_classes();

create trigger client_accounts_separate_identity_classes
before insert or update of auth_user_id on public.client_accounts
for each row execute function private.enforce_separate_identity_classes();

insert into public.staff_role_catalog (role_code, display_name, description)
values
    ('overall_admin', 'Overall Admin', 'Unrestricted LORDBLESS internal access.'),
    ('finance_manager', 'Finance Manager', 'Finance permissions without unrestricted Admin access.'),
    ('desk_staff', 'Desk Staff', 'Operational access scoped to assigned desks.')
on conflict (role_code) do update
set display_name = excluded.display_name,
    description = excluded.description;

insert into public.permissions (permission_code, description)
values
    ('admin.all', 'Unrestricted access to all internal LORDBLESS functions and records.'),
    ('dashboard.read', 'Read the Admin dashboard.'),
    ('enquiries.read', 'Read enquiries within authorized scope.'),
    ('enquiries.write', 'Update enquiries within authorized scope.'),
    ('clients.read', 'Read clients within authorized scope.'),
    ('clients.write', 'Update clients within authorized scope.'),
    ('clients.portal_access', 'Request creation of Client Portal access.'),
    ('finance.read', 'Read authorized finance records.'),
    ('finance.requests', 'Create and manage payment requests.'),
    ('finance.reminders', 'Send payment reminders.'),
    ('finance.verify', 'Verify received payments.'),
    ('finance.receipts', 'Read and manage appropriate receipts.'),
    ('documents.read', 'Read documents within authorized scope.'),
    ('documents.review', 'Review documents within authorized scope.'),
    ('journeys.read', 'Read journeys within authorized scope.'),
    ('journeys.write', 'Update journeys within authorized scope.'),
    ('applications.read', 'Read applications within authorized scope.'),
    ('applications.write', 'Update applications within authorized scope.'),
    ('messages.read', 'Read messages within authorized scope.'),
    ('messages.write', 'Create and manage messages within authorized scope.'),
    ('followups.read', 'Read follow-ups within authorized scope.'),
    ('stories.read', 'Read client stories and testimonials.'),
    ('settings.read', 'Read system settings.'),
    ('team.manage', 'Manage staff roles, permissions, and desk assignments.'),
    ('settings.manage', 'Manage system settings.')
on conflict (permission_code) do update
set description = excluded.description;

insert into public.role_permissions (role_code, permission_code)
values
    ('overall_admin', 'admin.all'),
    ('overall_admin', 'clients.portal_access'),

    ('finance_manager', 'finance.read'),
    ('finance_manager', 'finance.requests'),
    ('finance_manager', 'finance.reminders'),
    ('finance_manager', 'finance.verify'),
    ('finance_manager', 'finance.receipts'),

    ('desk_staff', 'enquiries.read'),
    ('desk_staff', 'dashboard.read'),
    ('desk_staff', 'enquiries.write'),
    ('desk_staff', 'clients.read'),
    ('desk_staff', 'clients.write'),
    ('desk_staff', 'followups.read'),
    ('desk_staff', 'documents.read'),
    ('desk_staff', 'documents.review'),
    ('desk_staff', 'journeys.read'),
    ('desk_staff', 'journeys.write'),
    ('desk_staff', 'applications.read'),
    ('desk_staff', 'applications.write'),
    ('desk_staff', 'messages.read'),
    ('desk_staff', 'messages.write')
on conflict do nothing;

insert into public.desks (code, name)
values
    ('germany_europe', 'Germany & Europe Desk'),
    ('canada', 'Canada Desk'),
    ('china', 'China Desk')
on conflict (code) do update
set name = excluded.name;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger staff_profiles_set_updated_at
before update on public.staff_profiles
for each row execute function private.set_updated_at();

create trigger desks_set_updated_at
before update on public.desks
for each row execute function private.set_updated_at();

create trigger client_accounts_set_updated_at
before update on public.client_accounts
for each row execute function private.set_updated_at();

create or replace function private.is_current_staff()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
    select exists (
        select 1
        from public.staff_profiles sp
        join public.staff_roles sr on sr.user_id = sp.user_id
        where sp.user_id = auth.uid()
          and sp.active
    );
$$;

create or replace function private.is_overall_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
    select exists (
        select 1
        from public.staff_profiles sp
        where sp.user_id = auth.uid()
          and sp.active
          and (
              exists (
                  select 1
                  from public.staff_roles sr
                  where sr.user_id = sp.user_id
                    and sr.role_code = 'overall_admin'
              )
              or exists (
                  select 1
                  from public.staff_permissions up
                  where up.user_id = sp.user_id
                    and up.permission_code = 'admin.all'
              )
              or exists (
                  select 1
                  from public.staff_roles sr
                  join public.role_permissions rp on rp.role_code = sr.role_code
                  where sr.user_id = sp.user_id
                    and rp.permission_code = 'admin.all'
              )
          )
    );
$$;

create or replace function private.has_permission(p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, private
as $$
    select private.is_overall_admin()
        or exists (
            select 1
            from public.staff_profiles sp
            where sp.user_id = auth.uid()
              and sp.active
              and (
                  exists (
                      select 1
                      from public.staff_permissions up
                      where up.user_id = sp.user_id
                        and up.permission_code = p_permission_code
                  )
                  or exists (
                      select 1
                      from public.staff_roles sr
                      join public.role_permissions rp on rp.role_code = sr.role_code
                      where sr.user_id = sp.user_id
                        and rp.permission_code = p_permission_code
                  )
              )
        );
$$;

create or replace function private.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
    select ca.client_id
    from public.client_accounts ca
    where ca.auth_user_id = auth.uid()
      and ca.access_status = 'active'
    limit 1;
$$;

create or replace function public.activate_client_account()
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
    activated_status text;
begin
    if auth.uid() is null then
        raise exception 'Authentication is required.' using errcode = '42501';
    end if;

    if not exists (
        select 1
        from auth.users au
        where au.id = auth.uid()
          and au.email_confirmed_at is not null
    ) then
        raise exception 'The invited email address must be confirmed first.' using errcode = '42501';
    end if;

    update public.client_accounts ca
    set access_status = 'active',
        activated_at = coalesce(ca.activated_at, now())
    where ca.auth_user_id = auth.uid()
      and ca.access_status = 'invited'
    returning ca.access_status into activated_status;

    if activated_status is not null then
        return activated_status;
    end if;

    select ca.access_status
    into activated_status
    from public.client_accounts ca
    where ca.auth_user_id = auth.uid();

    if activated_status = 'active' then
        return activated_status;
    end if;

    raise exception 'There is no pending invitation to activate.' using errcode = '42501';
end;
$$;

create or replace function private.has_desk_access(p_desk_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, private
as $$
    select private.is_overall_admin()
        or (
            private.is_current_staff()
            and exists (
                select 1
                from public.staff_desks sd
                where sd.user_id = auth.uid()
                  and sd.desk_id = p_desk_id
            )
        );
$$;

create or replace function private.can_access_client(p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, private
as $$
    select p_client_id is not null
        and (
            private.is_overall_admin()
            or private.current_client_id() = p_client_id
            or exists (
                select 1
                from public.client_desk_assignments cda
                join public.staff_desks sd on sd.desk_id = cda.desk_id
                where cda.client_id = p_client_id
                  and sd.user_id = auth.uid()
                  and private.is_current_staff()
            )
        );
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.enforce_separate_identity_classes() from public, anon, authenticated;
revoke all on function public.activate_client_account() from public, anon;
grant execute on function public.activate_client_account() to authenticated;
revoke all on function private.is_current_staff() from public, anon;
revoke all on function private.is_overall_admin() from public, anon;
revoke all on function private.has_permission(text) from public, anon;
revoke all on function private.current_client_id() from public, anon;
revoke all on function private.has_desk_access(uuid) from public, anon;
revoke all on function private.can_access_client(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_current_staff() to authenticated;
grant execute on function private.is_overall_admin() to authenticated;
grant execute on function private.has_permission(text) to authenticated;
grant execute on function private.current_client_id() to authenticated;
grant execute on function private.has_desk_access(uuid) to authenticated;
grant execute on function private.can_access_client(uuid) to authenticated;

alter table public.staff_profiles enable row level security;
alter table public.staff_role_catalog enable row level security;
alter table public.staff_roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.staff_permissions enable row level security;
alter table public.desks enable row level security;
alter table public.staff_desks enable row level security;
alter table public.client_desk_assignments enable row level security;
alter table public.client_accounts enable row level security;

grant select on public.staff_profiles, public.staff_roles,
    public.staff_permissions, public.staff_desks,
    public.client_accounts, public.client_desk_assignments,
    public.staff_role_catalog, public.permissions,
    public.role_permissions, public.desks to authenticated;
revoke all on public.staff_profiles, public.staff_roles,
    public.staff_permissions, public.staff_desks,
    public.client_accounts, public.client_desk_assignments,
    public.staff_role_catalog, public.permissions,
    public.role_permissions, public.desks from anon;

create policy staff_profiles_read_self_or_overall_admin
on public.staff_profiles for select to authenticated
using (user_id = auth.uid() or private.is_overall_admin());

create policy staff_role_catalog_read_authenticated
on public.staff_role_catalog for select to authenticated using (true);

create policy staff_roles_read_self_or_overall_admin
on public.staff_roles for select to authenticated
using (user_id = auth.uid() or private.is_overall_admin());

create policy permissions_read_authenticated
on public.permissions for select to authenticated using (true);

create policy role_permissions_read_authenticated
on public.role_permissions for select to authenticated using (true);

create policy staff_permissions_read_self_or_overall_admin
on public.staff_permissions for select to authenticated
using (user_id = auth.uid() or private.is_overall_admin());

create policy desks_read_authenticated
on public.desks for select to authenticated using (true);

create policy staff_desks_read_self_or_overall_admin
on public.staff_desks for select to authenticated
using (user_id = auth.uid() or private.is_overall_admin());

create policy client_desk_assignments_read_assigned_desk
on public.client_desk_assignments for select to authenticated
using (private.has_desk_access(desk_id));

create policy client_accounts_read_self_or_authorized_staff
on public.client_accounts for select to authenticated
using (
    auth_user_id = auth.uid()
    or private.is_overall_admin()
    or private.has_permission('clients.portal_access')
);

alter table public.clients enable row level security;
grant select, update on public.clients to authenticated;
revoke all on public.clients from anon;

create policy clients_read_self_or_scoped_staff
on public.clients for select to authenticated
using (
    private.current_client_id() = id
    or private.is_overall_admin()
    or (
        private.has_permission('clients.read')
        and private.can_access_client(id)
    )
);

create policy clients_update_scoped_staff
on public.clients for update to authenticated
using (
    private.is_overall_admin()
    or (
        private.has_permission('clients.write')
        and private.can_access_client(id)
    )
)
with check (
    private.is_overall_admin()
    or (
        private.has_permission('clients.write')
        and private.can_access_client(id)
    )
);

alter table public.client_documents enable row level security;
grant select, update on public.client_documents to authenticated;
revoke all on public.client_documents from anon;

create policy client_documents_read_self_or_scoped_staff
on public.client_documents for select to authenticated
using (
    private.current_client_id() = client_id
    or private.is_overall_admin()
    or (
        private.has_permission('documents.read')
        and private.can_access_client(client_id)
    )
);

create policy client_documents_review_scoped_staff
on public.client_documents for update to authenticated
using (
    private.is_overall_admin()
    or (
        private.has_permission('documents.review')
        and private.can_access_client(client_id)
    )
)
with check (
    private.is_overall_admin()
    or (
        private.has_permission('documents.review')
        and private.can_access_client(client_id)
    )
);

alter table public.document_requests enable row level security;
grant select on public.document_requests to authenticated;
revoke all on public.document_requests from anon;

create policy document_requests_read_self_or_scoped_staff
on public.document_requests for select to authenticated
using (
    private.current_client_id() = client_id
    or private.is_overall_admin()
    or (
        private.has_permission('documents.read')
        and private.can_access_client(client_id)
    )
);

alter table public.enquiry_requirements enable row level security;
grant select on public.enquiry_requirements to authenticated;
revoke all on public.enquiry_requirements from anon;

create policy enquiry_requirements_read_via_client_document
on public.enquiry_requirements for select to authenticated
using (
    private.is_overall_admin()
    or exists (
        select 1
        from public.client_documents cd
        where cd.id = client_document_id
          and (
              private.current_client_id() = cd.client_id
              or (
                  private.has_permission('documents.read')
                  and private.can_access_client(cd.client_id)
              )
          )
    )
);

alter table public.document_review_history enable row level security;
grant select on public.document_review_history to authenticated;
revoke all on public.document_review_history from anon;

create policy document_review_history_read_via_client_document
on public.document_review_history for select to authenticated
using (
    private.is_overall_admin()
    or exists (
        select 1
        from public.client_documents cd
        where cd.id = document_id
          and (
              private.current_client_id() = cd.client_id
              or (
                  private.has_permission('documents.read')
                  and private.can_access_client(cd.client_id)
              )
          )
    )
);

-- Deliberately no policy is added to public.enquiries in this migration.
