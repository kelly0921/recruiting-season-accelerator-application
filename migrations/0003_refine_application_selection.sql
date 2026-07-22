ALTER TABLE applications
  ADD COLUMN applications_submitted INTEGER NOT NULL DEFAULT 0;

ALTER TABLE applications
  ADD COLUMN first_interviews INTEGER NOT NULL DEFAULT 0;

ALTER TABLE applications
  ADD COLUMN final_rounds INTEGER NOT NULL DEFAULT 0;

ALTER TABLE applications
  ADD COLUMN offers_received INTEGER NOT NULL DEFAULT 0;

ALTER TABLE applications
  ADD COLUMN scheduling_constraints TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN community_commitment INTEGER NOT NULL DEFAULT 1;
