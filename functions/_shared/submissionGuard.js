const minimumCompletionMs = 1500;
const defaultWindowMs = 60 * 60 * 1000;

export function validateRequestSize(
  request,
  maxBytes,
  tooLargeMessage = 'The submission is too large.',
) {
  const rawLength = request.headers.get('Content-Length');
  if (!rawLength) return '';

  const contentLength = Number(rawLength);
  if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
    return 'The submission size could not be verified.';
  }
  if (contentLength > maxBytes) {
    return tooLargeMessage;
  }
  return '';
}

async function hashRateLimitKey(secret, scope, clientAddress) {
  const encoded = new TextEncoder().encode(`${secret}:${scope}:${clientAddress}`);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
  return [...digest].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function checkSubmissionRateLimit({
  database,
  request,
  secret,
  scope,
  maxAttempts,
  windowMs = defaultWindowMs,
  now = Date.now(),
}) {
  if (!database || !String(secret || '').trim()) {
    throw new Error('Submission rate limiting is not configured.');
  }

  const clientAddress = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await hashRateLimitKey(secret, scope, clientAddress);
  const cutoff = now - windowMs;
  const updatedAt = new Date(now).toISOString();
  const row = await database.prepare(
    `INSERT INTO submission_rate_limits (
       rate_limit_key, scope, window_started_at, attempts, updated_at
     ) VALUES (?1, ?2, ?3, 1, ?4)
     ON CONFLICT(rate_limit_key) DO UPDATE SET
       attempts = CASE
         WHEN submission_rate_limits.window_started_at <= ?5 THEN 1
         ELSE submission_rate_limits.attempts + 1
       END,
       window_started_at = CASE
         WHEN submission_rate_limits.window_started_at <= ?5 THEN ?3
         ELSE submission_rate_limits.window_started_at
       END,
       updated_at = ?4
     RETURNING attempts, window_started_at`,
  ).bind(key, scope, now, updatedAt, cutoff).first();

  if (!row) throw new Error('Submission rate limit could not be evaluated.');

  const attempts = Number(row.attempts);
  const windowStartedAt = Number(row.window_started_at);
  return {
    allowed: Number.isFinite(attempts) && attempts <= maxAttempts,
    attempts,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((windowStartedAt + windowMs - now) / 1000),
    ),
  };
}

export function validateSubmissionGuard(request, formData, now = Date.now()) {
  if (String(formData.get('website') || '').trim()) {
    return 'Submission could not be verified. Reload the page and try again.';
  }

  const startedAt = Number(formData.get('formStartedAt'));
  if (!Number.isFinite(startedAt) || startedAt <= 0 || now - startedAt < minimumCompletionMs) {
    return 'Submission could not be verified. Reload the page and try again.';
  }

  const origin = request.headers.get('Origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return 'Submission could not be verified. Reload the page and try again.';
      }
    } catch {
      return 'Submission could not be verified. Reload the page and try again.';
    }
  }

  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) {
    return 'Submission could not be verified. Reload the page and try again.';
  }

  return '';
}
