ALTER TABLE courses ADD COLUMN cover_image_path text;

ALTER TABLE courses ADD CONSTRAINT courses_cover_image_path_check CHECK (
  cover_image_path IS NULL
  OR cover_image_path ~ '^courses/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
);
