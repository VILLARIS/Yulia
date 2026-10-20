-- La duración ahora la decide el estudiante al finalizar manualmente.
ALTER TABLE clinical_cases
  DROP COLUMN IF EXISTS max_student_turns;
