create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  welcome_sent boolean not null default false,
  tyc_accepted boolean not null default false,
  photo_url text,
  created_date timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  photo_url text,
  severity text not null check (severity in ('verde', 'naranja', 'rojo')),
  category text not null default 'Otro'
    check (category in ('Eléctrico', 'Sanitario', 'Mobiliario', 'Infraestructura', 'Otro')),
  status text not null default 'pendiente' check (status in ('pendiente', 'resuelto')),
  map_x double precision check (map_x between 0 and 100),
  map_y double precision check (map_y between 0 and 100),
  location_label text,
  reporter_name text not null,
  reporter_email text not null,
  resolved_photo_url text,
  resolved_notes text,
  upvotes text[] not null default '{}',
  created_date timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  user_name text not null,
  user_email text not null,
  content text not null,
  created_date timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  report_id uuid references public.reports (id) on delete set null,
  reporter_name text not null,
  report_title text not null,
  location_label text,
  recipient_email text,
  is_read boolean not null default false,
  created_date timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  flow_type text not null check (flow_type in ('registro_otp', 'restablecer_contrasena')),
  status text not null default 'enviado' check (status in ('enviado', 'error')),
  created_date timestamptz not null default now()
);

create index reports_created_date_idx on public.reports (created_date desc);
create index reports_status_idx on public.reports (status);
create index reports_reporter_email_idx on public.reports (lower(reporter_email));
create index comments_report_created_date_idx on public.comments (report_id, created_date);
create index notifications_created_date_idx on public.notifications (created_date desc);
create index notifications_recipient_email_idx on public.notifications (lower(recipient_email));
create index email_logs_created_date_idx on public.email_logs (created_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'admininframap@gmail.com'
    or lower(coalesce((select auth.jwt() ->> 'email'), '')) like '%@ietirafaelnaviavaron.edu.co';
$$;

create or replace function public.toggle_report_upvote(target_report_id uuid)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_upvotes text[];
  current_email text;
begin
  if not (select public.is_allowed_user()) then
    raise exception 'No tienes permiso para apoyar reportes.';
  end if;

  current_email := lower((select auth.jwt() ->> 'email'));
  if current_email is null then
    raise exception 'Se requiere una sesión activa.';
  end if;

  select reports.upvotes
  into current_upvotes
  from public.reports
  where reports.id = target_report_id
  for update;

  if not found then
    raise exception 'No se encontró el reporte.';
  end if;

  if current_email = any(current_upvotes) then
    current_upvotes := array_remove(current_upvotes, current_email);
  else
    current_upvotes := array_append(current_upvotes, current_email);
  end if;

  update public.reports
  set upvotes = current_upvotes
  where id = target_report_id;

  return current_upvotes;
end;
$$;

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.email_logs enable row level security;

grant usage on schema public to authenticated;
grant select, update (full_name, welcome_sent, tyc_accepted, photo_url) on public.profiles to authenticated;
grant select, insert, update, delete on public.reports to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert, update on public.notifications to authenticated;
grant select, insert on public.email_logs to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_allowed_user() to authenticated;
grant execute on function public.toggle_report_upvote(uuid) to authenticated;

create policy "Profiles are visible to their owner and admins"
on public.profiles for select to authenticated
using (
  (select public.is_allowed_user())
  and (id = (select auth.uid()) or (select public.is_admin()))
);

create policy "Users can update their profile without changing their role"
on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select public.is_admin()))
with check (
  (select public.is_allowed_user())
  and (
    (id = (select auth.uid()) and role = 'user')
    or (select public.is_admin())
  )
);

create policy "Authenticated users can view reports"
on public.reports for select to authenticated
using ((select public.is_allowed_user()));

create policy "Users can create their own reports"
on public.reports for insert to authenticated
with check (
  (select public.is_allowed_user())
  and lower(reporter_email) = lower((select auth.jwt() ->> 'email'))
);

create policy "Report owners and admins can update reports"
on public.reports for update to authenticated
using (
  (select public.is_allowed_user())
  and (
    lower(reporter_email) = lower((select auth.jwt() ->> 'email'))
    or (select public.is_admin())
  )
)
with check (
  (select public.is_allowed_user())
  and (
    lower(reporter_email) = lower((select auth.jwt() ->> 'email'))
    or (select public.is_admin())
  )
);

create policy "Report owners and admins can delete reports"
on public.reports for delete to authenticated
using (
  (select public.is_allowed_user())
  and (
    lower(reporter_email) = lower((select auth.jwt() ->> 'email'))
    or (select public.is_admin())
  )
);

create policy "Authenticated users can view comments"
on public.comments for select to authenticated
using ((select public.is_allowed_user()));

create policy "Users can comment as themselves"
on public.comments for insert to authenticated
with check (
  (select public.is_allowed_user())
  and lower(user_email) = lower((select auth.jwt() ->> 'email'))
);

create policy "Comment owners and admins can update comments"
on public.comments for update to authenticated
using (
  (select public.is_allowed_user())
  and (
    lower(user_email) = lower((select auth.jwt() ->> 'email'))
    or (select public.is_admin())
  )
)
with check (
  (select public.is_allowed_user())
  and (
    lower(user_email) = lower((select auth.jwt() ->> 'email'))
    or (select public.is_admin())
  )
);

create policy "Comment owners and admins can delete comments"
on public.comments for delete to authenticated
using (
  (select public.is_allowed_user())
  and (
    lower(user_email) = lower((select auth.jwt() ->> 'email'))
    or (select public.is_admin())
  )
);

create policy "Admins and notification recipients can view notifications"
on public.notifications for select to authenticated
using (
  (select public.is_allowed_user())
  and (
    (select public.is_admin())
    or lower(recipient_email) = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Report owners and admins can create notifications"
on public.notifications for insert to authenticated
with check (
  (select public.is_allowed_user())
  and (
    (select public.is_admin())
    or exists (
      select 1
      from public.reports
      where reports.id = notifications.report_id
        and lower(reports.reporter_email) = lower((select auth.jwt() ->> 'email'))
    )
  )
);

create policy "Admins and notification recipients can update notifications"
on public.notifications for update to authenticated
using (
  (select public.is_allowed_user())
  and (
    (select public.is_admin())
    or lower(recipient_email) = lower((select auth.jwt() ->> 'email'))
  )
)
with check (
  (select public.is_allowed_user())
  and (
    (select public.is_admin())
    or lower(recipient_email) = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Admins can view email logs"
on public.email_logs for select to authenticated
using ((select public.is_allowed_user()) and (select public.is_admin()));

create policy "Users can create email logs for themselves"
on public.email_logs for insert to authenticated
with check (
  (select public.is_allowed_user())
  and (
    lower(recipient_email) = lower((select auth.jwt() ->> 'email'))
    or (select public.is_admin())
  )
);

insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do update set public = excluded.public;

create policy "Anyone can view report photos"
on storage.objects for select
using (bucket_id = 'report-photos');

create policy "Users can upload photos to their own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'report-photos'
  and (select public.is_allowed_user())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owners and admins can update report photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'report-photos'
  and (select public.is_allowed_user())
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select public.is_admin())
  )
)
with check (
  bucket_id = 'report-photos'
  and (select public.is_allowed_user())
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select public.is_admin())
  )
);

create policy "Owners and admins can delete report photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'report-photos'
  and (select public.is_allowed_user())
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select public.is_admin())
  )
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports'
    ) then
      execute 'alter publication supabase_realtime add table public.reports';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments'
    ) then
      execute 'alter publication supabase_realtime add table public.comments';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      execute 'alter publication supabase_realtime add table public.notifications';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'email_logs'
    ) then
      execute 'alter publication supabase_realtime add table public.email_logs';
    end if;
  end if;
end;
$$;
