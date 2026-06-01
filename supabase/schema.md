# Schéma de la base — IA Sensibilisation

Diagramme entité-association (ERD). Rendu graphique : aperçu Markdown de VS Code
(avec un plugin Mermaid), sur GitHub/GitLab, ou en collant le bloc sur
[mermaid.live](https://mermaid.live).

```mermaid
erDiagram
    auth_users ||--|| users : "id (1-1)"
    services   ||--o{ users : "service_id"

    users          ||--o{ quiz_sessions      : "created_by (admin)"
    users          ||--o{ user_quiz_sessions : "user_id"

    quiz_sessions  ||--o{ session_questions  : "quiz_session_id"
    questions      ||--o{ session_questions  : "question_id"

    questions      ||--o{ answer_options     : "question_id"

    quiz_sessions  ||--o{ user_quiz_sessions : "quiz_session_id"

    user_quiz_sessions ||--o{ user_answers   : "user_quiz_session_id"
    questions          ||--o{ user_answers   : "question_id"
    answer_options     ||--o{ user_answers   : "answer_option_id"

    auth_users {
        uuid id PK "géré par Supabase Auth"
    }

    services {
        uuid id PK
        varchar name UK
        text description
        timestamptz created_at
    }

    users {
        uuid id PK,FK "→ auth.users"
        varchar first_name
        varchar last_name
        user_role role "user | admin"
        uuid service_id FK "→ services"
        varchar job_title
        skill_level declared_level
        skill_level current_level "adaptatif"
        int total_score
        timestamptz created_at
        timestamptz updated_at
    }

    quiz_sessions {
        uuid id PK
        varchar title
        varchar access_code UK "ex GEM-4X2"
        uuid created_by FK "→ users"
        skill_level difficulty_level
        session_type type "weekly | custom"
        session_status status "pending | active | closed"
        timestamptz scheduled_at
        timestamptz closed_at
        timestamptz created_at
    }

    questions {
        uuid id PK
        text content
        question_type type
        skill_level difficulty_level
        question_theme theme
        text explanation
        int base_points
        timestamptz created_at
    }

    answer_options {
        uuid id PK
        uuid question_id FK "→ questions"
        text content
        boolean is_correct
        int order_index
    }

    session_questions {
        uuid id PK
        uuid quiz_session_id FK "→ quiz_sessions"
        uuid question_id FK "→ questions"
        int position
    }

    user_quiz_sessions {
        uuid id PK
        uuid user_id FK "→ users"
        uuid quiz_session_id FK "→ quiz_sessions"
        int score
        float success_rate "0.0 – 1.0"
        skill_level level_snapshot
        attempt_status status "in_progress | completed | abandoned"
        timestamptz started_at
        timestamptz completed_at
    }

    user_answers {
        uuid id PK
        uuid user_quiz_session_id FK "→ user_quiz_sessions"
        uuid question_id FK "→ questions"
        uuid answer_option_id FK "→ answer_options"
        boolean is_correct
        int points_earned
        timestamptz answered_at
    }
```

## Légende des relations

| Notation | Signification |
|----------|---------------|
| `\|\|--\|\|` | un-à-un (1-1) |
| `\|\|--o{` | un-à-plusieurs (1-N) |
| `PK` | clé primaire · `FK` clé étrangère · `UK` contrainte d'unicité |

## Vue dérivée (hors diagramme)

`daily_ranking` — **vue** (pas une table), calculée dynamiquement à partir de
`user_quiz_sessions` + `users` + `services` pour le classement quotidien
(global et par service).

## Types ENUM

- **user_role** : `user`, `admin`
- **skill_level** : `beginner` < `curious` < `expert`
- **session_type** : `weekly`, `custom`
- **session_status** : `pending`, `active`, `closed`
- **question_type** : `single_choice`, `multiple_choice`, `true_false`
- **question_theme** : `capacites`, `limites`, `dangers`, `ethique_societe`
- **attempt_status** : `in_progress`, `completed`, `abandoned`
