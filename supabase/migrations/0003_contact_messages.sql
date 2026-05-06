-- Contact-form messages
-- Replaces the previous "analytics_events with event_type=contact_form_submit" approach.

-- 1. Status enum
do $$ begin
  if not exists (select 1 from pg_type where typname = 'contact_message_status') then
    create type contact_message_status as enum ('unread', 'read', 'replied');
  end if;
end $$;

-- 2. Table
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  message     text not null,
  status      contact_message_status not null default 'unread',
  admin_notes text,
  replied_at  timestamptz,
  user_agent  text,
  ip_address  text
);

create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);
create index if not exists contact_messages_status_idx     on contact_messages (status);

-- 3. RLS
alter table contact_messages enable row level security;

drop policy if exists contact_messages_public_insert on contact_messages;
create policy contact_messages_public_insert on contact_messages
  for insert with check (true);

drop policy if exists contact_messages_admin_all on contact_messages;
create policy contact_messages_admin_all on contact_messages
  for all using (is_admin()) with check (is_admin());

-- 4. Backfill existing analytics_events rows (if any)
insert into contact_messages (created_at, name, email, message, status)
select
  ae.created_at,
  coalesce(ae.metadata->>'name', 'Unknown') as name,
  coalesce(ae.metadata->>'email', '') as email,
  coalesce(ae.metadata->>'message', '') as message,
  'unread'::contact_message_status
from analytics_events ae
where ae.event_type = 'contact_form_submit'
  and ae.metadata is not null
  and not exists (
    select 1 from contact_messages cm
    where cm.email = ae.metadata->>'email'
      and cm.created_at = ae.created_at
  );
