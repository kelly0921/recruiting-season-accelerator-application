ALTER TABLE applications
  ADD COLUMN recruiting_market TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN target_list TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN adult_confirmed INTEGER NOT NULL DEFAULT 0;

ALTER TABLE applications
  ADD COLUMN acknowledgements_accepted_at TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN terms_version TEXT NOT NULL DEFAULT '';
