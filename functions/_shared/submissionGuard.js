const minimumCompletionMs = 1500;

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
