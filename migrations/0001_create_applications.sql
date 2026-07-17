CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school TEXT NOT NULL,
  major TEXT NOT NULL,
  graduation_year TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  portfolio_url TEXT NOT NULL DEFAULT '',
  resume_key TEXT NOT NULL,
  resume_original_name TEXT NOT NULL,
  opportunities TEXT NOT NULL,
  company_environments TEXT NOT NULL,
  current_experience TEXT NOT NULL,
  recruiting_history TEXT NOT NULL,
  three_month_goal TEXT NOT NULL,
  primary_obstacle TEXT NOT NULL,
  worthwhile_change TEXT NOT NULL,
  feedback_priority TEXT NOT NULL,
  program_fit TEXT NOT NULL,
  desired_support TEXT NOT NULL,
  referral_source TEXT NOT NULL,
  marketing_consent INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_applications_status
  ON applications(status);

CREATE INDEX IF NOT EXISTS idx_applications_submitted_at
  ON applications(submitted_at);

