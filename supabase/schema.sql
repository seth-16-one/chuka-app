create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('student', 'lecturer', 'admin')),
  reg_number text unique,
  staff_number text unique,
  department text,
  phone text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('class', 'group', 'department')),
  course_code text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null,
  sender_role text not null check (sender_role in ('student', 'lecturer', 'admin')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  audience text not null,
  day text not null,
  day_order int not null default 0,
  time text not null,
  title text not null,
  venue text not null,
  course_code text not null,
  lecturer text not null,
  status text not null default 'upcoming',
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null,
  author text not null,
  priority text not null default 'normal',
  published_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_code text not null,
  author text not null,
  summary text not null,
  file_label text not null,
  storage_path text,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  otp_code text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.login_otp_sessions (
  id text primary key,
  email text not null,
  token text not null,
  refresh_token text not null,
  user_payload jsonb not null,
  session_id text,
  request_ip text,
  user_agent text,
  ip_location jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create table if not exists public.device_sessions (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_name text not null,
  user_agent text,
  ip_address text,
  ip_location jsonb,
  ip_city text,
  ip_region text,
  ip_country text,
  token_kind text not null default 'access',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text
);

create table if not exists public.student_finance_status (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_cents bigint not null default 0,
  paid_cents bigint not null default 0,
  due_cents bigint not null default 0,
  fees_cleared boolean not null default true,
  last_payment_at timestamptz,
  status_label text,
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_code text not null,
  audience text not null,
  author text not null,
  summary text not null,
  file_label text not null,
  storage_path text,
  mime_type text,
  original_file_name text,
  file_size bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  is_published boolean not null default true
);

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null check (document_type in ('gatepass', 'exam-card', 'transcript')),
  file_name text not null,
  mime_type text not null default 'application/pdf',
  storage_path text,
  file_size bigint,
  fees_cleared boolean not null default false,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('campus-files', 'campus-files', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

alter table public.profiles enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.announcements enable row level security;
alter table public.notes enable row level security;

create policy "Profiles are visible to authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Profiles can be inserted by authenticated users"
  on public.profiles
  for insert
  to authenticated
  with check (true);

create policy "Chat rooms visible to authenticated users"
  on public.chat_rooms
  for select
  to authenticated
  using (true);

create policy "Chat messages visible to authenticated users"
  on public.chat_messages
  for select
  to authenticated
  using (true);

create policy "Chat messages insertable by authenticated users"
  on public.chat_messages
  for insert
  to authenticated
  with check (true);

create policy "Timetable visible to authenticated users"
  on public.timetable_entries
  for select
  to authenticated
  using (true);

create policy "Announcements visible to authenticated users"
  on public.announcements
  for select
  to authenticated
  using (true);

create policy "Notes visible to authenticated users"
  on public.notes
  for select
  to authenticated
  using (true);

alter table public.otp_verifications enable row level security;
alter table public.login_otp_sessions enable row level security;
alter table public.device_sessions enable row level security;
alter table public.student_finance_status enable row level security;
alter table public.staff_materials enable row level security;
alter table public.student_documents enable row level security;

create policy "OTP can be created by anon users (registration)"
  on public.otp_verifications
  for insert
  to anon, authenticated
  with check (true);

create policy "OTP can be read by anon users (during registration)"
  on public.otp_verifications
  for select
  to anon, authenticated
  using (true);

create policy "OTP can be updated by anon users (verification)"
  on public.otp_verifications
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Device sessions are visible to the signed-in owner"
  on public.device_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Device sessions can be updated by the signed-in owner"
  on public.device_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Finance status visible to the signed-in owner"
  on public.student_finance_status
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Finance status can be updated by the signed-in owner"
  on public.student_finance_status
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Staff materials visible to authenticated users"
  on public.staff_materials
  for select
  to authenticated
  using (true);

create policy "Staff materials can be created by staff"
  on public.staff_materials
  for insert
  to authenticated
  with check (true);

create policy "Student documents visible to owner"
  on public.student_documents
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Student documents can be created by owner"
  on public.student_documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Campus files uploads by owner"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'campus-files'
    and (
      (
        (storage.foldername(name))[1] = 'students'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (
        (storage.foldername(name))[1] = 'teachers'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

create policy "Campus files readable by signed-in owners and authenticated users"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'campus-files'
    and (
      (
        (storage.foldername(name))[1] = 'students'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (storage.foldername(name))[1] = 'teachers'
    )
  );

create policy "Campus files updatable by owner"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'campus-files'
    and (
      (
        (storage.foldername(name))[1] = 'students'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (
        (storage.foldername(name))[1] = 'teachers'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  )
  with check (
    bucket_id = 'campus-files'
    and (
      (
        (storage.foldername(name))[1] = 'students'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (
        (storage.foldername(name))[1] = 'teachers'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

create policy "Campus files deletable by owner"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'campus-files'
    and (
      (
        (storage.foldername(name))[1] = 'students'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (
        (storage.foldername(name))[1] = 'teachers'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();
