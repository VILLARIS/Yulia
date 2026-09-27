CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE session_status AS ENUM ('created', 'active', 'interrupted', 'completed', 'cancelled');
CREATE TYPE message_role AS ENUM ('student', 'tutor', 'system');
CREATE TYPE supervision_event_type AS ENUM (
  'evaluation_started', 'evaluation_completed', 'paste_attempt', 'window_left',
  'window_returned', 'session_interrupted', 'recording_started', 'recording_stopped'
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role user_role NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clinical_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subject text NOT NULL,
  difficulty text NOT NULL,
  topic text NOT NULL,
  clinical_situation text NOT NULL,
  academic_challenge text NOT NULL,
  learning_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  tutor_instructions text NOT NULL,
  rubric_definition jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE simulation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id),
  clinical_case_id uuid NOT NULL REFERENCES clinical_cases(id),
  case_version integer NOT NULL,
  status session_status NOT NULL DEFAULT 'created',
  current_stage text NOT NULL DEFAULT 'inicio',
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  stage text NOT NULL,
  content text NOT NULL,
  sequence_number integer NOT NULL,
  model_metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, sequence_number)
);

CREATE TABLE evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES simulation_sessions(id),
  final_score numeric(4,1) CHECK (final_score BETWEEN 0 AND 20),
  global_level text,
  personalized_feedback text NOT NULL,
  improvement_recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  definitive boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rubric_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criterion_key text NOT NULL,
  criterion_label text NOT NULL,
  score numeric(2,1) NOT NULL CHECK (score BETWEEN 0 AND 5),
  achievement_level text NOT NULL,
  evidence text NOT NULL,
  UNIQUE (evaluation_id, criterion_key)
);

CREATE TABLE supervision_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id),
  event_type supervision_event_type NOT NULL,
  occurred_at timestamptz NOT NULL,
  duration_ms integer CHECK (duration_ms IS NULL OR duration_ms >= 0),
  client_event_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, client_event_id)
);

CREATE TABLE recording_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES simulation_sessions(id),
  consented_at timestamptz NOT NULL,
  storage_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size_bytes bigint CHECK (size_bytes >= 0),
  status text NOT NULL,
  started_at timestamptz,
  stopped_at timestamptz,
  delete_after timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX simulation_sessions_student_idx ON simulation_sessions(student_id, created_at DESC);
CREATE INDEX conversation_messages_session_idx ON conversation_messages(session_id, sequence_number);
CREATE INDEX supervision_events_session_idx ON supervision_events(session_id, occurred_at);

