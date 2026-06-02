-- ============================================================================
--  Seed — Données de test
-- ============================================================================
--  Mot de passe de tous les comptes : Test1234!
--  À exécuter dans : Supabase Dashboard → SQL Editor → New query
--  ⚠ Exécuter schema.sql en premier si ce n'est pas encore fait.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Services
-- ----------------------------------------------------------------------------
insert into services (id, name, description) values
  ('10000000-0000-0000-0000-000000000001', 'Ressources Humaines', 'Recrutement, paie et gestion RH'),
  ('10000000-0000-0000-0000-000000000002', 'Finance',             'Comptabilité et contrôle de gestion'),
  ('10000000-0000-0000-0000-000000000003', 'Marketing',           'Communication et stratégie de marque'),
  ('10000000-0000-0000-0000-000000000004', 'Informatique',        'Infrastructure et développement'),
  ('10000000-0000-0000-0000-000000000005', 'Direction',           'Comité de direction et stratégie');

-- ----------------------------------------------------------------------------
-- 2. Utilisateurs (auth.users + users)
-- ----------------------------------------------------------------------------
insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, is_super_admin
) values
  ('20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'alice.martin@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false),
  ('20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'bob.dupont@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false),
  ('20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'claire.lebrun@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false),
  ('20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'david.moreau@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false),
  ('20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'emma.petit@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false),
  ('20000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'francois.simon@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false),
  ('20000000-0000-0000-0000-000000000007',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'grace.thomas@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false),
  ('20000000-0000-0000-0000-000000000008',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'hugo.martin@test.fr',
   crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), false);

-- Profils applicatifs (même UUIDs)
insert into users (id, first_name, last_name, role, service_id, job_title, declared_level, current_level) values
  ('20000000-0000-0000-0000-000000000001', 'Alice',    'Martin',  'user',    '10000000-0000-0000-0000-000000000001', 'Chargée RH',            'beginner', 'beginner'),
  ('20000000-0000-0000-0000-000000000002', 'Bob',      'Dupont',  'user',    '10000000-0000-0000-0000-000000000002', 'Contrôleur de gestion', 'beginner', 'beginner'),
  ('20000000-0000-0000-0000-000000000003', 'Claire',   'Lebrun',  'user',    '10000000-0000-0000-0000-000000000003', 'Chef de projet digital','curious',  'curious'),
  ('20000000-0000-0000-0000-000000000004', 'David',    'Moreau',  'user',    '10000000-0000-0000-0000-000000000004', 'Développeur backend',   'curious',  'curious'),
  ('20000000-0000-0000-0000-000000000005', 'Emma',     'Petit',   'manager', '10000000-0000-0000-0000-000000000005', 'Directrice générale',   'expert',   'expert'),
  ('20000000-0000-0000-0000-000000000006', 'François', 'Simon',   'user',    '10000000-0000-0000-0000-000000000001', 'Responsable formation', 'curious',  'curious'),
  ('20000000-0000-0000-0000-000000000007', 'Grace',    'Thomas',  'manager', '10000000-0000-0000-0000-000000000002', 'DAF',                   'expert',   'expert'),
  ('20000000-0000-0000-0000-000000000008', 'Hugo',     'Martin',  'user',    '10000000-0000-0000-0000-000000000003', 'Responsable digital',   'expert',   'expert');

-- ----------------------------------------------------------------------------
-- 3. Questions (subset pour tester — seed complet via questions.json à venir)
-- ----------------------------------------------------------------------------

insert into questions (id, content, type, difficulty_level, theme, explanation, base_points) values
  -- Niveau : beginner
  ('30000000-0000-0000-0000-000000000001',
   'Qu''est-ce que l''intelligence artificielle (IA) ?',
   'single_choice', 'beginner', 'capacites',
   'L''IA regroupe des techniques permettant aux machines d''accomplir des tâches qui nécessitaient autrefois l''intelligence humaine.',
   10),
  ('30000000-0000-0000-0000-000000000002',
   'Est-ce qu''une IA comme ChatGPT peut se tromper dans ses réponses ?',
   'single_choice', 'beginner', 'limites',
   'Les IA peuvent halluciner : inventer des faits avec beaucoup d''assurance. Il faut toujours vérifier les informations importantes.',
   10),
  ('30000000-0000-0000-0000-000000000003',
   'Qu''est-ce qu''un deepfake ?',
   'single_choice', 'beginner', 'dangers',
   'Les deepfakes sont des contenus synthétiques très réalistes créés par IA, utilisés pour usurper l''identité ou diffuser de la désinformation.',
   10),
  -- Niveau : curious
  ('30000000-0000-0000-0000-000000000004',
   'Comment une IA apprend-elle à reconnaître des photos de chats ?',
   'single_choice', 'curious', 'capacites',
   'C''est le principe du machine learning : l''IA apprend par l''exemple en identifiant des patterns visuels communs.',
   15),
  ('30000000-0000-0000-0000-000000000005',
   'Qu''est-ce que le biais algorithmique ?',
   'single_choice', 'curious', 'ethique_societe',
   'Si les données d''entraînement reflètent des inégalités, le modèle peut reproduire ces discriminations.',
   15),
  ('30000000-0000-0000-0000-000000000006',
   'Pourquoi un chatbot IA ne connaît-il pas les événements très récents ?',
   'single_choice', 'curious', 'limites',
   'Un LLM est entraîné sur des données jusqu''à une certaine date (knowledge cutoff). Il ignore tout ce qui s''est passé après.',
   15),
  -- Niveau : expert
  ('30000000-0000-0000-0000-000000000007',
   'Qu''est-ce que le RLHF (apprentissage par renforcement avec retour humain) ?',
   'single_choice', 'expert', 'capacites',
   'Le RLHF est la technique clé derrière l''alignement des LLMs : des humains notent les réponses pour affiner le comportement du modèle.',
   20),
  ('30000000-0000-0000-0000-000000000008',
   'Qu''est-ce que le RAG (Retrieval-Augmented Generation) ?',
   'single_choice', 'expert', 'capacites',
   'Le RAG connecte un LLM à des sources externes pour réduire les hallucinations et fournir des informations à jour.',
   20),
  ('30000000-0000-0000-0000-000000000009',
   'Qu''est-ce qu''une attaque par prompt injection contre un agent IA ?',
   'single_choice', 'expert', 'dangers',
   'Des instructions malveillantes insérées dans des données lues par un agent IA peuvent détourner son comportement.',
   20);

insert into answer_options (id, question_id, content, is_correct, order_index) values
  -- Q1
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Un robot humanoïde capable de marcher et parler', false, 0),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Un logiciel antivirus très avancé', false, 1),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Un super-ordinateur connecté à internet', false, 2),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'Un ensemble de technologies permettant à des machines d''effectuer des tâches normalement réservées à l''intelligence humaine', true, 3),
  -- Q2
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'Non, elle vérifie toujours ses informations avant de répondre', false, 0),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'Oui, elle peut donner des informations fausses avec beaucoup d''assurance', true, 1),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', 'Non, elle accède à toutes les données d''internet en temps réel', false, 2),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', 'Oui, mais uniquement sur des sujets très techniques', false, 3),
  -- Q3
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000003', 'Un e-mail frauduleux envoyé en masse', false, 0),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000003', 'Un faux profil sur les réseaux sociaux', false, 1),
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000003', 'Un virus informatique très dangereux', false, 2),
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000003', 'Une vidéo ou audio truqué grâce à l''IA pour faire dire quelque chose à quelqu''un', true, 3),
  -- Q4
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000004', 'Elle recherche le mot « chat » dans les métadonnées', false, 0),
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000004', 'Un programmeur lui décrit l''apparence d''un chat', false, 1),
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000004', 'Elle copie la définition depuis un dictionnaire', false, 2),
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000004', 'Elle analyse des milliers d''exemples pour identifier des patterns visuels communs', true, 3),
  -- Q5
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000005', 'Un algorithme plus rapide pour certains utilisateurs', false, 0),
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000005', 'Des discriminations reproduites par un modèle à partir de données déséquilibrées', true, 1),
  ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000005', 'Une erreur de calcul due au manque de puissance', false, 2),
  ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000005', 'Une préférence pour les calculs complexes', false, 3),
  -- Q6
  ('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000006', 'Il efface ses données toutes les semaines', false, 0),
  ('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000006', 'Les événements récents sont trop complexes pour lui', false, 1),
  ('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000006', 'Il est interdit d''accès aux informations récentes par la loi', false, 2),
  ('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000006', 'Son entraînement s''est arrêté à une certaine date, appelée date de coupure', true, 3),
  -- Q7
  ('40000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000007', 'Un algorithme issu des jeux vidéo adapté à la robotique', false, 0),
  ('40000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000007', 'Un système qui récompense financièrement l''IA', false, 1),
  ('40000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000007', 'Des humains s''affrontent contre l''IA pour l''entraîner', false, 2),
  ('40000000-0000-0000-0000-000000000028', '30000000-0000-0000-0000-000000000007', 'Des annotateurs humains notent les réponses pour affiner le comportement du modèle', true, 3),
  -- Q8
  ('40000000-0000-0000-0000-000000000029', '30000000-0000-0000-0000-000000000008', 'Un algorithme de compression des modèles', false, 0),
  ('40000000-0000-0000-0000-000000000030', '30000000-0000-0000-0000-000000000008', 'Un format de fichier pour partager des modèles', false, 1),
  ('40000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000008', 'Une technique qui connecte un LLM à des sources externes pour réduire les hallucinations', true, 2),
  ('40000000-0000-0000-0000-000000000032', '30000000-0000-0000-0000-000000000008', 'Un réseau de neurones convolutifs pour la vision', false, 3),
  -- Q9
  ('40000000-0000-0000-0000-000000000033', '30000000-0000-0000-0000-000000000009', 'Une attaque qui surcharge les serveurs avec des milliers de requêtes', false, 0),
  ('40000000-0000-0000-0000-000000000034', '30000000-0000-0000-0000-000000000009', 'Une technique qui insère des données malveillantes dans des images', false, 1),
  ('40000000-0000-0000-0000-000000000035', '30000000-0000-0000-0000-000000000009', 'L''insertion d''instructions malveillantes dans des données lues par un agent IA', true, 2),
  ('40000000-0000-0000-0000-000000000036', '30000000-0000-0000-0000-000000000009', 'Un virus qui corrompt les fichiers d''entraînement d''un modèle', false, 3);

-- ----------------------------------------------------------------------------
-- 4. Sessions de quiz (créées par le système — created_by NULL)
-- ----------------------------------------------------------------------------
insert into quiz_sessions (id, title, created_by, difficulty_level, type, status, scheduled_at) values
  ('50000000-0000-0000-0000-000000000001', 'Session semaine 23-2026', null, 'beginner', 'weekly', 'active', now()),
  ('50000000-0000-0000-0000-000000000002', 'Session semaine 23-2026', null, 'curious',  'weekly', 'active', now()),
  ('50000000-0000-0000-0000-000000000003', 'Session semaine 23-2026', null, 'expert',   'weekly', 'active', now());

insert into session_questions (quiz_session_id, question_id, position) values
  -- Session beginner
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 2),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 3),
  -- Session curious
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 1),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 2),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000006', 3),
  -- Session expert
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000007', 1),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000008', 2),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000009', 3);

-- ----------------------------------------------------------------------------
-- 5. Participations (pour tester le classement et le niveau adaptatif)
-- ----------------------------------------------------------------------------
insert into user_quiz_sessions (id, user_id, quiz_session_id, score, success_rate, level_snapshot, status, completed_at) values
  -- Alice : 2/3 → 0.67 → niveau maintenu (beginner)
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 20, 0.67, 'beginner', 'completed', now()),
  -- Bob : 3/3 → 1.0 → monte à curious
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 30, 1.0,  'beginner', 'completed', now()),
  -- François : 1/3 → 0.33 → descend à beginner
  ('60000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000002', 15, 0.33, 'curious',  'completed', now()),
  -- Claire : 3/3 → 1.0 → monte à expert
  ('60000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', 45, 1.0,  'curious',  'completed', now()),
  -- Hugo : 2/3 → 0.67 → niveau maintenu (expert)
  ('60000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000003', 40, 0.67, 'expert',   'completed', now()),
  -- David : en cours
  ('60000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002',  0, null, 'curious',  'in_progress', null);

insert into user_answers (user_quiz_session_id, question_id, answer_option_id, is_correct, points_earned) values
  -- Alice : Q1 faux, Q2 vrai, Q3 vrai
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', false, 0),
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006', true,  10),
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000012', true,  10),
  -- Bob : tout bon
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', true,  10),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006', true,  10),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000012', true,  10),
  -- François : Q1 faux, Q2 faux, Q3 vrai
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000013', false, 0),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000017', false, 0),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000024', true,  15),
  -- Claire : tout bon
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000016', true,  15),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000018', true,  15),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000024', true,  15),
  -- Hugo : Q7 faux, Q8 vrai, Q9 vrai
  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000025', false, 0),
  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000031', true,  20),
  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000035', true,  20);

-- ============================================================================
--  Comptes de test (mot de passe : Test1234!)
-- ============================================================================
--  Email                      Rôle      Service       Niveau départ  → après session
--  alice.martin@test.fr       user      RH            beginner       → maintenu
--  bob.dupont@test.fr         user      Finance       beginner       → monte curious
--  claire.lebrun@test.fr      user      Marketing     curious        → monte expert
--  david.moreau@test.fr       user      Informatique  curious        → en cours
--  emma.petit@test.fr         manager   Direction     expert         → pas de session
--  francois.simon@test.fr     user      RH            curious        → descend beginner
--  grace.thomas@test.fr       manager   Finance       expert         → pas de session
--  hugo.martin@test.fr        user      Marketing     expert         → maintenu
-- ============================================================================
