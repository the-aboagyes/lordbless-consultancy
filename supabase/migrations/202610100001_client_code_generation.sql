-- Permanent human-readable client IDs.
-- The clients.id UUID remains the primary key. Legacy rows are not backfilled.

do $$
declare
    clients_table_oid oid;
    client_code_type oid;
begin
    clients_table_oid := to_regclass('public.clients');
    if clients_table_oid is null then
        raise exception 'Required table public.clients is missing.';
    end if;

    if not exists (
        select 1
        from pg_catalog.pg_attribute a
        where a.attrelid = clients_table_oid
          and a.attname = 'id'
          and a.atttypid = 'uuid'::regtype
          and a.attnum > 0
          and not a.attisdropped
    ) then
        raise exception 'public.clients.id must remain the existing UUID identity key.';
    end if;

    if exists (
        select 1
        from pg_catalog.pg_attribute a
        where a.attrelid = clients_table_oid
          and a.attname in ('client_number', 'client_reference', 'client_identifier', 'public_client_id')
          and a.attnum > 0
          and not a.attisdropped
    ) then
        raise exception 'A possible existing human-readable client identifier column exists. Verify and reuse it before applying this migration.';
    end if;

    select a.atttypid
    into client_code_type
    from pg_catalog.pg_attribute a
    where a.attrelid = clients_table_oid
      and a.attname = 'client_code'
      and a.attnum > 0
      and not a.attisdropped;

    if client_code_type is null then
        alter table public.clients add column client_code text;
    elsif client_code_type <> 'text'::regtype then
        raise exception 'public.clients.client_code exists but is not text; verify the live schema before applying.';
    end if;

    if exists (
        select 1
        from public.clients
        where client_code is not null
          and client_code !~ '^LBC-CL[0-9]{2}-[0-9]{4}$'
    ) then
        raise exception 'Existing public.clients.client_code values do not match LBC-CLYY-NNNN; no client IDs were changed.';
    end if;
end;
$$;

create unique index if not exists clients_client_code_unique_idx
    on public.clients (client_code)
    where client_code is not null;

create table if not exists private.client_code_sequences (
    registration_year integer primary key check (registration_year between 2000 and 9999),
    last_number integer not null check (last_number between 0 and 9999),
    updated_at timestamptz not null default now()
);

revoke all on table private.client_code_sequences from public, anon, authenticated;

-- Preserve valid codes already present; do not assign codes to legacy rows.
insert into private.client_code_sequences (
    registration_year,
    last_number
)
select
    2000 + substring(client_code from 7 for 2)::integer,
    max(substring(client_code from 10 for 4)::integer)
from public.clients
where client_code is not null
group by substring(client_code from 7 for 2)
on conflict (registration_year) do update
set last_number = greatest(
        private.client_code_sequences.last_number,
        excluded.last_number
    ),
    updated_at = now();

create or replace function private.next_client_code()
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
    current_registration_year integer := extract(
        year from (statement_timestamp() at time zone 'UTC')
    )::integer;
    next_number integer;
begin
    insert into private.client_code_sequences (
        registration_year,
        last_number,
        updated_at
    )
    values (current_registration_year, 1, now())
    on conflict (registration_year) do update
    set last_number = private.client_code_sequences.last_number + 1,
        updated_at = now()
    returning last_number into next_number;

    if next_number > 9999 then
        raise exception 'Client ID sequence for year % is exhausted.', current_registration_year;
    end if;

    return 'LBC-CL'
        || lpad((current_registration_year % 100)::text, 2, '0')
        || '-'
        || lpad(next_number::text, 4, '0');
end;
$$;

create or replace function private.assign_client_code()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
    if tg_op = 'INSERT' then
        if new.client_code is not null then
            raise exception 'client_code is assigned by the database and cannot be supplied by the caller.';
        end if;

        new.client_code := private.next_client_code();
        return new;
    end if;

    if new.client_code is distinct from old.client_code then
        raise exception 'An assigned client_code is permanent and cannot be changed.';
    end if;

    return new;
end;
$$;

revoke all on function private.next_client_code() from public, anon, authenticated;
revoke all on function private.assign_client_code() from public, anon, authenticated;

drop trigger if exists clients_assign_client_code on public.clients;
create trigger clients_assign_client_code
before insert or update of client_code on public.clients
for each row execute function private.assign_client_code();
