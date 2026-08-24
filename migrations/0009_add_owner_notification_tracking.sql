ALTER TABLE applications
  ADD COLUMN owner_notification_status TEXT NOT NULL DEFAULT 'not_attempted';

ALTER TABLE applications
  ADD COLUMN owner_notification_sent_at TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN owner_notification_error TEXT NOT NULL DEFAULT '';

ALTER TABLE applications
  ADD COLUMN owner_notification_message_id TEXT NOT NULL DEFAULT '';
