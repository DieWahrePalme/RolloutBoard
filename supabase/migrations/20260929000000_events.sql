-- RolloutBoard: one row per report sent by a PC.
create table public.events (
  id         bigint generated always as identity primary key,
  client     text not null check (char_length(client) between 1 and 100),
  text       text not null check (char_length(text) between 1 and 500),
  state      text not null default 'running'
             check (state in ('running', 'done', 'error', 'finished')),
  created_at timestamptz not null default now()
);

create index events_created_at_idx on public.events (created_at desc);

-- Anon may only read. Inserts happen via the edge function (service role bypasses RLS).
alter table public.events enable row level security;

create policy "anon can read events"
  on public.events for select
  to anon
  using (true);

-- Realtime: broadcast INSERTs to the board.
alter publication supabase_realtime add table public.events;
