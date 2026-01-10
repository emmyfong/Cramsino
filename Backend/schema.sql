-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Users are managed by Supabase auth; reference auth.users where needed.

create table if not exists study_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    start_time timestamptz not null default now(),
    end_time timestamptz
);

create index if not exists idx_study_sessions_user_id on study_sessions(user_id);

create table if not exists cv_events (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references study_sessions(id) on delete cascade,
    face_present boolean not null,
    looking_forward boolean not null,
    talking boolean not null,
    distracted boolean not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_cv_events_session_id on cv_events(session_id);

create table if not exists cards (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    rarity text not null,
    image_url text not null,
    aura text not null,
    type text not null
);

create index if not exists idx_cards_rarity on cards(rarity);

create table if not exists user_cards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references cards(id) on delete cascade,
    acquired_at timestamptz not null default now()
);

create index if not exists idx_user_cards_user_id on user_cards(user_id);
create index if not exists idx_user_cards_card_id on user_cards(card_id);

create table if not exists gacha_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    pull_count integer not null,
    results jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_gacha_logs_user_id on gacha_logs(user_id);
