CREATE TABLE IF NOT EXISTS submission_rate_limits (
  rate_limit_key TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  window_started_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submission_rate_limits_updated_at
  ON submission_rate_limits(updated_at);
