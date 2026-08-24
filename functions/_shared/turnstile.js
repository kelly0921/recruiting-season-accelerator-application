export async function verifyTurnstile(
  token,
  secret,
  ip,
  { expectedAction = '', expectedHostname = '' } = {},
) {
  if (!secret || !token || token.length > 2048) {
    return {
      success: false,
      errorCodes: [!secret ? 'missing-input-secret' : 'missing-or-invalid-response'],
    };
  }

  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    if (!response.ok) {
      return {
        success: false,
        errorCodes: [`siteverify-http-${response.status}`],
      };
    }

    const result = await response.json();
    const actionMatches = !expectedAction || result.action === expectedAction;
    const hostnameMatches = !expectedHostname || result.hostname === expectedHostname;
    const errorCodes = [...(result['error-codes'] || [])];
    if (!actionMatches) errorCodes.push('action-mismatch');
    if (!hostnameMatches) errorCodes.push('hostname-mismatch');

    return {
      success: Boolean(result.success && actionMatches && hostnameMatches),
      errorCodes,
      action: result.action || '',
      hostname: result.hostname || '',
    };
  } catch (error) {
    return {
      success: false,
      errorCodes: ['siteverify-request-failed'],
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
