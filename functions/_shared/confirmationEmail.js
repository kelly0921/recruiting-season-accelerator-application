const programName = 'Recruiting Season Accelerator';
const programUrl = 'https://recruiting-accelerator-apply.pages.dev/';
const defaultReplyTo = 'kellychenmeiyi@gmail.com';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function firstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || 'there';
}

function singleLine(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function emailRow(label, value) {
  return `
    <tr>
      <th style="width:150px;padding:10px 14px 10px 0;border-bottom:1px solid #e5e9ee;color:#607589;font-size:13px;text-align:left;vertical-align:top;">${escapeHtml(label)}</th>
      <td style="padding:10px 0;border-bottom:1px solid #e5e9ee;color:#253f57;font-size:14px;">${escapeHtml(value || 'Not provided')}</td>
    </tr>`;
}

export function buildApplicationConfirmationEmail({ fullName, email, reference }) {
  const safeName = escapeHtml(firstName(fullName));
  const safeReference = escapeHtml(reference);
  const subject = `We Received Your ${programName} Application`;
  const text = [
    `Hi ${firstName(fullName)},`,
    '',
    `Thank you for applying to the Fall 2026 ${programName} founding cohort. Your application has been received.`,
    '',
    `Application reference: ${reference}`,
    'Decisions are planned for September 3, 2026.',
    '',
    'No action is needed right now. If you are selected, onboarding details will be sent to this email address before the program begins on September 14.',
    '',
    'This message confirms receipt of your application; it is not an acceptance decision.',
    '',
    `Program details: ${programUrl}`,
    `Questions or corrections: ${defaultReplyTo}`,
    '',
    'Kelly Chen',
    programName,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f6f3ed;color:#163052;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Fall 2026 founding-cohort application has been received.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ed;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #d9e0e8;border-radius:18px;overflow:hidden;">
            <tr><td style="height:7px;background:#3d6f92;"></td></tr>
            <tr>
              <td style="padding:36px 38px 18px;">
                <p style="margin:0 0 12px;color:#567087;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">${programName}</p>
                <h1 style="margin:0;color:#163052;font-size:28px;line-height:1.25;">Application Received</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 38px 34px;color:#344d63;font-size:16px;line-height:1.65;">
                <p style="margin:0 0 18px;">Hi ${safeName},</p>
                <p style="margin:0 0 22px;">Thank you for applying to the Fall 2026 founding cohort. Your application has been received.</p>
                <div style="margin:0 0 24px;padding:18px 20px;background:#edf4f7;border-left:4px solid #3d6f92;border-radius:8px;">
                  <span style="display:block;margin-bottom:5px;color:#567087;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Application Reference</span>
                  <strong style="color:#163052;font-size:21px;letter-spacing:1px;">${safeReference}</strong>
                </div>
                <p style="margin:0 0 12px;"><strong style="color:#163052;">What happens next</strong></p>
                <p style="margin:0 0 18px;">No action is needed right now. Decisions are planned for September 3, 2026. If you are selected, onboarding details will be sent to this email address before the program begins on September 14.</p>
                <p style="margin:0 0 24px;color:#567087;font-size:14px;">This message confirms receipt of your application; it is not an acceptance decision.</p>
                <p style="margin:0 0 26px;"><a href="${programUrl}" style="color:#2c648b;font-weight:700;">Review the program details</a></p>
                <p style="margin:0;">Kelly Chen<br><span style="color:#567087;">${programName}</span></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 38px;background:#f3f6f8;color:#607589;font-size:12px;line-height:1.55;">
                Questions or corrections? Reply to this email or contact
                <a href="mailto:${defaultReplyTo}" style="color:#2c648b;">${defaultReplyTo}</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    to: email,
    from: {
      address: '',
      name: programName,
    },
    reply_to: defaultReplyTo,
    subject,
    html,
    text,
  };
}

export function buildOwnerApplicationNotificationEmail({ application, reference }) {
  const ownerEmail = '';
  const roles = Array.isArray(application.rolesExploring)
    ? application.rolesExploring.join(', ')
    : String(application.rolesExploring || '');
  const subject = `New ${programName} Application · ${singleLine(application.fullName)}`;
  const fields = [
    ['Reference', reference],
    ['Submitted', application.submittedAt],
    ['Name', application.fullName],
    ['Email', application.email],
    ['School', application.school],
    ['Academic Area', application.major],
    ['Fall 2026 College Year', application.academicStage],
    ['Expected Graduation', application.graduationDate],
    ['Roles or Paths', roles],
    ['Conference Plans', application.conferenceInterest],
    ['LinkedIn', application.linkedInUrl],
  ];
  const text = [
    `New ${programName} application`,
    '',
    ...fields.map(([label, value]) => `${label}: ${value || 'Not provided'}`),
    '',
    'The full application is stored in D1. The resume is stored privately in R2.',
    `Resume key: ${application.resumeKey}`,
    '',
    'Reply to this email to contact the applicant directly.',
  ].join('\n');
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f6f3ed;color:#163052;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ed;padding:30px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d9e0e8;border-radius:18px;overflow:hidden;">
            <tr><td style="height:7px;background:#3d6f92;"></td></tr>
            <tr>
              <td style="padding:32px 36px;">
                <p style="margin:0 0 10px;color:#567087;font-size:12px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;">${programName}</p>
                <h1 style="margin:0 0 8px;color:#163052;font-size:26px;line-height:1.25;">New Application Received</h1>
                <p style="margin:0 0 22px;color:#567087;font-size:14px;line-height:1.55;">The application and private resume were saved successfully before this notification was sent.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #d9e0e8;">
                  ${fields.map(([label, value]) => emailRow(label, value)).join('')}
                </table>
                <div style="margin-top:22px;padding:15px 17px;background:#edf4f7;border-radius:10px;color:#344d63;font-size:14px;line-height:1.55;">
                  Review the full answers in D1 and retrieve the matching resume from the private R2 object:<br>
                  <strong style="color:#163052;">${escapeHtml(application.resumeKey)}</strong>
                </div>
                <p style="margin:22px 0 0;color:#567087;font-size:13px;">Reply to this email to contact ${escapeHtml(application.fullName)} directly.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    to: ownerEmail,
    from: {
      address: '',
      name: programName,
    },
    reply_to: application.email,
    subject,
    html,
    text,
  };
}

async function sendEmailPayload({ env, payload, recipient, fetchImpl }) {
  const requiredConfiguration = [
    ['CLOUDFLARE_ACCOUNT_ID', env.CLOUDFLARE_ACCOUNT_ID],
    ['CLOUDFLARE_EMAIL_API_TOKEN', env.CLOUDFLARE_EMAIL_API_TOKEN],
    ['CONFIRMATION_FROM_EMAIL', env.CONFIRMATION_FROM_EMAIL],
  ];
  const missing = requiredConfiguration
    .filter(([, value]) => !String(value || '').trim())
    .map(([name]) => name);

  if (missing.length) {
    return {
      sent: false,
      status: 'not_configured',
      error: `Missing email configuration: ${missing.join(', ')}.`,
    };
  }

  payload.to = recipient;
  payload.from.address = String(env.CONFIRMATION_FROM_EMAIL).trim();

  const response = await fetchImpl(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID)}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || result?.success !== true) {
    const details = result?.errors
      ?.map((error) => `${error.code}: ${error.message}`)
      .join('; ');
    throw new Error(details || `Cloudflare Email Service returned HTTP ${response.status}.`);
  }

  const normalizedEmail = String(recipient).trim().toLowerCase();
  const delivered = (result.result?.delivered || []).map((value) => value.toLowerCase());
  const queued = (result.result?.queued || []).map((value) => value.toLowerCase());
  const bounced = (result.result?.permanent_bounces || []).map((value) => value.toLowerCase());

  if (bounced.includes(normalizedEmail)) {
    throw new Error('The transactional email permanently bounced.');
  }

  if (!delivered.includes(normalizedEmail) && !queued.includes(normalizedEmail)) {
    throw new Error('Cloudflare accepted the request without confirming delivery or queueing.');
  }

  return {
    sent: true,
    status: delivered.includes(normalizedEmail) ? 'delivered' : 'queued',
    messageId: String(result.result?.message_id || ''),
    error: '',
  };
}

export async function sendApplicationConfirmation({
  env,
  fullName,
  email,
  reference,
  fetchImpl = fetch,
}) {
  const payload = buildApplicationConfirmationEmail({ fullName, email, reference });
  payload.reply_to = String(env.CONFIRMATION_REPLY_TO || defaultReplyTo).trim();
  return sendEmailPayload({ env, payload, recipient: email, fetchImpl });
}

export async function sendOwnerApplicationNotification({
  env,
  application,
  reference,
  fetchImpl = fetch,
}) {
  const recipient = String(
    env.OWNER_NOTIFY_EMAIL || env.CONFIRMATION_REPLY_TO || defaultReplyTo,
  ).trim();
  const payload = buildOwnerApplicationNotificationEmail({ application, reference });
  payload.reply_to = application.email;
  return sendEmailPayload({ env, payload, recipient, fetchImpl });
}
