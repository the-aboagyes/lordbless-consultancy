-- Allow authenticated Overall Admin users to read enquiries.
-- Desk-level enquiry authorization is intentionally not granted here.

alter table public.enquiries enable row level security;

grant select on public.enquiries to authenticated;

do $$
begin
    if not exists (
        select 1
        from pg_catalog.pg_policies
        where schemaname = 'public'
          and tablename = 'enquiries'
          and policyname = 'enquiries_select_overall_admin'
    ) then
        create policy enquiries_select_overall_admin
        on public.enquiries
        for select
        to authenticated
        using (private.is_overall_admin());
    end if;
end;
$$;
