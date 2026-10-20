ALTER TABLE clinical_cases
  ADD COLUMN max_student_turns integer NOT NULL DEFAULT 6
  CHECK (max_student_turns BETWEEN 3 AND 12);
