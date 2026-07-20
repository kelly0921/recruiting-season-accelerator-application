CREATE TABLE IF NOT EXISTS future_cohort_interest (
  id TEXT PRIMARY KEY,
  submitted_at TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school TEXT NOT NULL DEFAULT '',
  graduation_year TEXT NOT NULL,
  opportunity_interest TEXT NOT NULL,
  preferred_timing TEXT NOT NULL DEFAULT '',
  support_note TEXT NOT NULL DEFAULT '',
  announcement_consent INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_future_cohort_interest_submitted_at
  ON future_cohort_interest(submitted_at);
