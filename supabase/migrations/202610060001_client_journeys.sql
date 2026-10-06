-- Persistent client journey foundation.
-- Journeys are created by staff after the consultancy determines the case;
-- assessment payment, portal access, payments, and documents remain separate.

create table if not exists public.client_journeys (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients(id) on delete cascade,
    enquiry_id uuid references public.enquiries(id) on delete set null,
    journey_type text not null,
    title text not null,
    destination text not null default '',
    service text not null default '',
    status text not null default 'planning'
        check (status in ('planning', 'active', 'completed', 'cancelled')),
    internal_assignee_id uuid references public.staff_profiles(user_id) on delete set null,
    desk_id uuid references public.desks(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists client_journeys_client_id_idx
    on public.client_journeys (client_id);

create index if not exists client_journeys_enquiry_id_idx
    on public.client_journeys (enquiry_id)
    where enquiry_id is not null;

create index if not exists client_journeys_internal_assignee_id_idx
    on public.client_journeys (internal_assignee_id)
    where internal_assignee_id is not null;

create index if not exists client_journeys_desk_id_idx
    on public.client_journeys (desk_id)
    where desk_id is not null;

drop trigger if exists client_journeys_set_updated_at on public.client_journeys;
create trigger client_journeys_set_updated_at
before update on public.client_journeys
for each row execute function private.set_updated_at();

alter table public.client_journeys enable row level security;

revoke select on public.client_journeys from public, anon, authenticated;
revoke select (internal_assignee_id, desk_id)
    on public.client_journeys from public, authenticated, anon;
grant select (
    id,
    client_id,
    enquiry_id,
    journey_type,
    title,
    destination,
    service,
    status,
    created_at,
    updated_at
) on public.client_journeys to authenticated;
grant insert, update on public.client_journeys to authenticated;
revoke all on public.client_journeys from public, anon;

drop policy if exists client_journeys_read_authorized on public.client_journeys;
create policy client_journeys_read_authorized
on public.client_journeys for select to authenticated
using (
    private.current_client_id() = client_id
    or private.is_overall_admin()
    or (
        private.has_permission('journeys.read')
        and (
            internal_assignee_id = auth.uid()
            or private.has_desk_access(desk_id)
            or (
                internal_assignee_id is null
                and desk_id is null
                and private.can_access_client(client_id)
            )
        )
    )
);

drop policy if exists client_journeys_create_authorized on public.client_journeys;
create policy client_journeys_create_authorized
on public.client_journeys for insert to authenticated
with check (
    private.is_overall_admin()
    or (
        private.has_permission('journeys.write')
        and private.can_access_client(client_id)
        and (
            internal_assignee_id = auth.uid()
            or private.has_desk_access(desk_id)
            or (
                internal_assignee_id is null
                and desk_id is null
            )
        )
    )
);

drop policy if exists client_journeys_update_authorized on public.client_journeys;
create policy client_journeys_update_authorized
on public.client_journeys for update to authenticated
using (
    private.is_overall_admin()
    or (
        private.has_permission('journeys.write')
        and private.can_access_client(client_id)
        and (
            internal_assignee_id = auth.uid()
            or private.has_desk_access(desk_id)
            or (
                internal_assignee_id is null
                and desk_id is null
            )
        )
    )
)
with check (
    private.is_overall_admin()
    or (
        private.has_permission('journeys.write')
        and private.can_access_client(client_id)
        and (
            internal_assignee_id = auth.uid()
            or private.has_desk_access(desk_id)
            or (
                internal_assignee_id is null
                and desk_id is null
            )
        )
    )
);

-- Authenticated clients can read only client-safe columns directly. Internal
-- users read assignment columns through this staff-only authorization view.
create or replace view public.client_journeys_internal_access
with (security_barrier = true)
as
select
    journeys.id,
    journeys.client_id,
    journeys.enquiry_id,
    journeys.journey_type,
    journeys.title,
    journeys.destination,
    journeys.service,
    journeys.status,
    journeys.created_at,
    journeys.updated_at,
    journeys.internal_assignee_id,
    journeys.desk_id
from public.client_journeys as journeys
where
    private.is_overall_admin()
    or (
        private.has_permission('journeys.read')
        and (
            journeys.internal_assignee_id = auth.uid()
            or private.has_desk_access(journeys.desk_id)
            or (
                journeys.internal_assignee_id is null
                and journeys.desk_id is null
                and private.can_access_client(journeys.client_id)
            )
        )
    );

revoke all on public.client_journeys_internal_access from public, anon;
grant select on public.client_journeys_internal_access to authenticated;
