CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) > 0),
  description text NOT NULL DEFAULT '',
  teacher_id uuid NOT NULL REFERENCES users(id),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX courses_teacher_idx ON courses(teacher_id, created_at DESC);

ALTER TABLE clinical_cases ADD COLUMN course_id uuid REFERENCES courses(id);
CREATE INDEX clinical_cases_course_idx ON clinical_cases(course_id, created_at DESC);

CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id),
  course_id uuid NOT NULL REFERENCES courses(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE INDEX enrollments_course_idx ON enrollments(course_id);
