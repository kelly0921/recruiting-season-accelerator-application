ALTER TABLE applications
  ADD COLUMN graduation_date TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN academic_stage TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN roles_exploring TEXT NOT NULL DEFAULT '[]';

ALTER TABLE applications
  ADD COLUMN fall_goal TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN obstacles TEXT NOT NULL DEFAULT '[]';

ALTER TABLE applications
  ADD COLUMN recent_action TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN kelly_question TEXT NOT NULL DEFAULT '';
