import {
  futureInterestRecord,
  validateFutureInterest,
} from '../_shared/validation.js';
import {
  checkSubmissionRateLimit,
  validateRequestSize,
  validateSubmissionGuard,
} from '../_shared/submissionGuard.js';

const maxInterestRequestBytes = 256 * 1024;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });

async function ensureInterestSchema(database) {
  await database.batch([
    database.prepare(`
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
      )
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_future_cohort_interest_submitted_at
      ON future_cohort_interest(submitted_at)
    `),
  ]);
}

export async function onRequestPost({ request, env }) {
  if (env.INTEREST_SUBMISSIONS_ENABLED === 'false') {
    return json({ error: 'Future cohort updates are temporarily paused.' }, 503);
  }

  if (!env.APPLICATIONS_DB || !env.SUBMISSION_RATE_LIMIT_SECRET) {
    return json({ error: 'Future cohort updates are still being configured.' }, 503);
  }

  const sizeError = validateRequestSize(request, maxInterestRequestBytes);
  if (sizeError) return json({ error: sizeError }, 413);

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return json({ error: 'Expected a multipart form submission.' }, 415);
  }

  let rateLimit;
  try {
    rateLimit = await checkSubmissionRateLimit({
      database: env.APPLICATIONS_DB,
      request,
      secret: env.SUBMISSION_RATE_LIMIT_SECRET,
      scope: 'future-interest',
      maxAttempts: 30,
    });
  } catch (error) {
    console.error(JSON.stringify({
      message: 'Future interest rate limit failed',
      error: error instanceof Error ? error.message : String(error),
    }));
    return json({ error: 'Future cohort updates are temporarily unavailable.' }, 503);
  }

  if (!rateLimit.allowed) {
    return json(
      { error: 'Too many submission attempts. Please wait before trying again.' },
      429,
      { 'Retry-After': String(rateLimit.retryAfterSeconds) },
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Unable to read the submitted form.' }, 400);
  }

  const guardError = validateSubmissionGuard(request, formData);
  if (guardError) return json({ error: guardError }, 400);

  const error = validateFutureInterest(formData);
  if (error) return json({ error }, 400);

  const record = futureInterestRecord(formData, crypto.randomUUID());

  try {
    await ensureInterestSchema(env.APPLICATIONS_DB);
    await env.APPLICATIONS_DB.prepare(
      `INSERT INTO future_cohort_interest (
        id, submitted_at, full_name, email, school, graduation_year,
        opportunity_interest, preferred_timing, support_note, announcement_consent
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
    ).bind(
      record.id,
      record.submittedAt,
      record.fullName,
      record.email,
      record.school,
      record.graduationYear,
      record.opportunityInterest,
      record.preferredTiming,
      record.supportNote,
      record.announcementConsent,
    ).run();
  } catch (databaseError) {
    if (String(databaseError.message).includes('UNIQUE')) {
      return json({ ok: true, alreadyRegistered: true });
    }
    console.error('Future cohort interest insert failed', databaseError);
    return json({ error: 'Your information could not be saved. Please try again.' }, 500);
  }

  return json({ ok: true }, 201);
}

export function onRequestGet() {
  return json({ error: 'Method not allowed.' }, 405);
}
