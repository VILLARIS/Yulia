CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users(id),
  title varchar(200) NOT NULL,
  description text NOT NULL DEFAULT '',
  youtube_url text NOT NULL,
  youtube_video_id varchar(32) NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX videos_teacher_idx ON videos (teacher_id, created_at DESC);
CREATE INDEX videos_published_idx ON videos (published, created_at DESC);
