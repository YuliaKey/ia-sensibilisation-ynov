-- ============================================================================
--  Schéma de base de données — IA Sensibilisation (Supabase / PostgreSQL)
-- ============================================================================
--  À exécuter dans : Supabase Dashboard → SQL Editor → New query.
--  Ordre : extensions → ENUMs → tables → index → triggers → vues → fonctions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
-- gen_random_uuid() est fourni par pgcrypto (activé par défaut sur Supabase).
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Types ENUM (à créer AVANT les tables)
-- ----------------------------------------------------------------------------

-- Rôle applicatif d'un utilisateur.
create type user_role as enum ('user', 'admin');

-- Niveau de compétence (ordre croissant : beginner < curious < expert).
-- NB : voir la note en bas du fichier sur le mapping depuis questions.json.
create type skill_level as enum ('beginner', 'curious', 'expert');

-- Origine d'une session de quiz.
create type session_type as enum ('weekly', 'custom');

-- Cycle de vie d'une session de quiz.
create type session_status as enum ('pending', 'active', 'closed');

-- Type de question (toutes les questions actuelles sont à choix unique).
create type question_type as enum ('single_choice', 'multiple_choice', 'true_false');

-- Thème d'une question (aligné sur le champ "category" de questions.json).
create type question_theme as enum ('capacites', 'limites', 'dangers', 'ethique_societe');

-- État de la participation d'un utilisateur à une session.
create type attempt_status as enum ('in_progress', 'completed', 'abandoned');

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- services ─ Pôles / départements de l'entreprise.
create table services (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(100) not null unique,
  description text,
  created_at  timestamptz  not null default now()
);

-- users ─ Comptes salariés, liés à auth.users (Supabase Auth).
-- password_hash / sso_provider / sso_sub sont gérés par auth.users, pas ici.
create table users (
  id             uuid primary key references auth.users (id) on delete cascade,
  first_name     varchar(100) not null,
  last_name      varchar(100) not null,
  role           user_role    not null default 'user',
  service_id     uuid         references services (id) on delete set null,
  job_title      varchar(150),
  declared_level skill_level  not null,           -- choisi à l'inscription, modifiable
  current_level  skill_level  not null,           -- évolue automatiquement (logique adaptative)
  total_score    int          not null default 0,
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

-- quiz_sessions ─ Sessions hebdomadaires (weekly) ou manuelles (custom).
create table quiz_sessions (
  id               uuid primary key default gen_random_uuid(),
  title            varchar(200)   not null,
  access_code      varchar(10)    unique,         -- ex : GEM-4X2 (sessions custom)
  created_by       uuid           references users (id) on delete set null,
  difficulty_level skill_level    not null,
  type             session_type   not null,
  status           session_status not null default 'pending',
  scheduled_at     timestamptz,
  closed_at        timestamptz,
  created_at       timestamptz    not null default now()
);

-- questions ─ Banque de questions (peuplée via seed depuis questions.json).
create table questions (
  id               uuid primary key default gen_random_uuid(),
  content          text           not null,
  type             question_type  not null default 'single_choice',
  difficulty_level skill_level    not null,
  theme            question_theme not null,
  explanation      text,                           -- affichée après la réponse
  base_points      int            not null default 10,
  created_at       timestamptz    not null default now()
);

-- answer_options ─ Options de réponse (une seule is_correct = true par question).
create table answer_options (
  id          uuid    primary key default gen_random_uuid(),
  question_id uuid    not null references questions (id) on delete cascade,
  content     text    not null,
  is_correct  boolean not null default false,
  order_index int     not null,
  unique (question_id, order_index)
);

-- session_questions ─ Questions rattachées à une session, dans un ordre précis.
create table session_questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_session_id uuid not null references quiz_sessions (id) on delete cascade,
  question_id     uuid not null references questions (id) on delete cascade,
  position        int  not null,
  unique (quiz_session_id, question_id),
  unique (quiz_session_id, position)
);

-- user_quiz_sessions ─ Participation d'un utilisateur à une session.
create table user_quiz_sessions (
  id              uuid           primary key default gen_random_uuid(),
  user_id         uuid           not null references users (id) on delete cascade,
  quiz_session_id uuid           not null references quiz_sessions (id) on delete cascade,
  score           int            not null default 0,
  success_rate    float          check (success_rate between 0.0 and 1.0),
  level_snapshot  skill_level    not null,         -- niveau de l'user au moment du jeu
  status          attempt_status not null default 'in_progress',
  started_at      timestamptz    not null default now(),
  completed_at    timestamptz,
  unique (user_id, quiz_session_id)                -- une participation par session
);

-- user_answers ─ Réponse individuelle d'un user à chaque question d'une session.
create table user_answers (
  id                    uuid    primary key default gen_random_uuid(),
  user_quiz_session_id  uuid    not null references user_quiz_sessions (id) on delete cascade,
  question_id           uuid    not null references questions (id) on delete cascade,
  answer_option_id      uuid    references answer_options (id) on delete set null,
  is_correct            boolean not null,
  points_earned         int     not null default 0,
  answered_at           timestamptz not null default now(),
  unique (user_quiz_session_id, question_id)       -- une réponse par question
);

-- ----------------------------------------------------------------------------
-- 3. Index (sur les clés étrangères les plus requêtées)
-- ----------------------------------------------------------------------------
create index idx_users_service              on users (service_id);
create index idx_quiz_sessions_created_by   on quiz_sessions (created_by);
create index idx_quiz_sessions_status       on quiz_sessions (status);
create index idx_answer_options_question    on answer_options (question_id);
create index idx_session_questions_session  on session_questions (quiz_session_id);
create index idx_session_questions_question on session_questions (question_id);
create index idx_uqs_user                   on user_quiz_sessions (user_id);
create index idx_uqs_session                on user_quiz_sessions (quiz_session_id);
create index idx_uqs_completed_at           on user_quiz_sessions (completed_at);
create index idx_user_answers_uqs           on user_answers (user_quiz_session_id);
create index idx_user_answers_question      on user_answers (question_id);

-- ----------------------------------------------------------------------------
-- 4. Triggers
-- ----------------------------------------------------------------------------

-- 4.a  Maintien automatique de users.updated_at.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

-- 4.b  À la complétion d'une session : cumule le score et applique le niveau adaptatif.
--      Déclenché quand user_quiz_sessions.status passe à 'completed'.
create or replace function on_session_completed()
returns trigger as $$
declare
  cur skill_level;
  nxt skill_level;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    -- Cumul du score global de l'utilisateur.
    update users set total_score = total_score + new.score where id = new.user_id;

    -- Logique de niveau adaptatif (beginner → curious → expert).
    select current_level into cur from users where id = new.user_id;

    if new.success_rate >= 0.8 then
      nxt := case cur when 'beginner' then 'curious'
                      when 'curious'  then 'expert'
                      else 'expert' end;
    elsif new.success_rate < 0.5 then
      nxt := case cur when 'expert'  then 'curious'
                      when 'curious' then 'beginner'
                      else 'beginner' end;
    else
      nxt := cur;  -- 0.5 – 0.79 : maintenu
    end if;

    update users set current_level = nxt where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_session_completed
  after update on user_quiz_sessions
  for each row execute function on_session_completed();

-- ----------------------------------------------------------------------------
-- 5. Vue : classement global du jour (calculé dynamiquement, pas de table)
-- ----------------------------------------------------------------------------
create view daily_ranking as
select
  u.id,
  u.first_name,
  u.last_name,
  u.service_id,
  s.name as service_name,
  sum(uqs.score) as daily_score,
  rank() over (order by sum(uqs.score) desc) as global_rank,
  rank() over (partition by u.service_id order by sum(uqs.score) desc) as service_rank
from user_quiz_sessions uqs
join users u    on u.id = uqs.user_id
join services s on s.id = u.service_id
where date(uqs.completed_at) = current_date
  and uqs.status = 'completed'
group by u.id, u.first_name, u.last_name, u.service_id, s.name;

-- ============================================================================
--  NOTE — Niveaux : 3 (spec) vs 5 (questions.json)
-- ============================================================================
--  La spec définit skill_level sur 3 paliers (beginner / curious / expert),
--  mais questions.json contient 5 difficulty_label :
--     1 Débutant · 2 Intermédiaire · 3 Confirmé · 4 Avancé · 5 Expert
--
--  Ce schéma suit la spec (3 niveaux). Mapping suggéré au moment du seed :
--     Débutant (1), Intermédiaire (2) → 'beginner'
--     Confirmé (3)                    → 'curious'
--     Avancé (4), Expert (5)          → 'expert'
--
--  Mapping des thèmes (category → question_theme) :
--     "Capacités"          → 'capacites'
--     "Limites"            → 'limites'
--     "Dangers"            → 'dangers'
--     "Éthique & société"  → 'ethique_societe'
--
--  → Si tu préfères conserver les 5 niveaux tels quels, il suffit de remplacer
--    l'ENUM skill_level par 5 valeurs et d'adapter la logique adaptative
--    (fonction on_session_completed). Dis-le moi et je régénère le fichier.
-- ============================================================================
