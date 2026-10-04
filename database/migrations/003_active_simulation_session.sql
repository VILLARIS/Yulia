CREATE UNIQUE INDEX simulation_sessions_one_active_per_student_case
  ON simulation_sessions (student_id, clinical_case_id)
  WHERE status = 'active';
