ALTER TABLE applications
  ADD COLUMN confirmation_email_status TEXT NOT NULL DEFAULT 'not_attempted';

ALTER TABLE applications
  ADD COLUMN confirmation_email_sent_at TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN confirmation_email_error TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN confirmation_email_message_id TEXT NOT NULL DEFAULT '';
