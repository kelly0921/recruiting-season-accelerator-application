export async function verifyTurnstile(token, secret, ip) {
  if (!secret || !token) return false;

  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body },
  );
  const result = await response.json();
  return Boolean(result.success);
}
