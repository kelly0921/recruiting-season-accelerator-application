ALTER TABLE applications
  ADD COLUMN conference_interest TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN conference_details TEXT NOT NULL DEFAULT '';
