import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  applicationRecord,
  futureInterestRecord,
  getApplicationState,
  maxResumeBytes,
  validateApplication,
  validateFutureInterest,
  validateResumeSignature,
} from '../functions/_shared/validation.js';
import {
  buildApplicationConfirmationEmail,
  buildOwnerApplicationNotificationEmail,
  sendApplicationConfirmation,
  sendOwnerApplicationNotification,
} from '../functions/_shared/confirmationEmail.js';
import { validateSubmissionGuard } from '../functions/_shared/submissionGuard.js';
import { applicationStepRequiresValidation } from '../src/program.js';

const landingSourceUrl = new URL('../src/LandingPage.jsx', import.meta.url);
const applicationSourceUrl = new URL('../src/main.jsx', import.meta.url);
const chromeSourceUrl = new URL('../src/siteChrome.jsx', import.meta.url);

const testFile = (
  name = 'resume.pdf',
  type = 'application/pdf',
  size = 1024,
) => {
  const bytes = new Uint8Array(size);
  if (size >= 5 && name.endsWith('.pdf') && type === 'application/pdf') {
    bytes.set(new TextEncoder().encode('%PDF-'));
  }
  return new File([bytes], name, { type });
};

function validApplication() {
  const data = new FormData();
  const values = {
    fullName: 'Example Applicant',
    email: 'applicant@example.com',
    school: 'Example University',
    major: 'Computer Science',
    graduationDate: '2029-05',
    academicStage: 'Sophomore',
    linkedInUrl: 'https://linkedin.com/in/example',
    fallGoal: 'This fall, I want to build a focused opportunity pipeline for software engineering internships and early-career programs. I want to identify roles that match my current experience, improve how I prioritize deadlines, and submit thoughtful applications consistently instead of reacting to opportunities after I discover them too late.',
    recentAction: 'During the past month, I created a spreadsheet of internship deadlines, revised two project bullets on my resume, and asked a teaching assistant for feedback. I then used that feedback to clarify the technical decisions I owned and applied to three early programs before their deadlines.',
    kellyQuestion: 'I want Kelly’s help deciding whether my biggest constraint is the way I position my existing projects or the opportunities I choose. I would like an outside perspective on which change is most likely to improve my results and what evidence I should build next.',
    conferenceInterest: 'Deciding which conference to pursue',
  };
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  data.append('rolesExploring', 'Software Engineering');
  data.append('obstacles', 'I am unsure what to prioritize');
  [
    'isAdult',
    'groupSessionCommitment',
    'individualSessionCommitment',
    'weeklyWorkCommitment',
    'applyFirstCommitment',
    'programAcknowledgement',
    'termsAcknowledgement',
  ].forEach((key) => data.set(key, 'yes'));
  data.set('resume', testFile());
  return data;
}

function validFutureInterest() {
  const data = new FormData();
  data.set('fullName', 'Future Participant');
  data.set('email', 'future@example.com');
  data.set('school', 'Example University');
  data.set('graduationYear', '2028');
  data.set('opportunityInterest', 'Software Engineering Internship');
  data.set('preferredTiming', 'Next Available Cohort');
  data.set('supportNote', 'I would like help improving interview conversion.');
  data.set('announcementConsent', 'yes');
  return data;
}

test('application dates enforce the Fall 2026 ET window', () => {
  assert.equal(getApplicationState(new Date('2026-08-23T23:59:59-04:00')), 'opening-soon');
  assert.equal(getApplicationState(new Date('2026-08-24T00:00:00-04:00')), 'open');
  assert.equal(getApplicationState(new Date('2026-08-31T23:59:59-04:00')), 'open');
  assert.equal(getApplicationState(new Date('2026-09-01T00:00:00-04:00')), 'closed');
});

test('the pre-launch application can be browsed without field validation', () => {
  assert.equal(applicationStepRequiresValidation('opening-soon'), false);
  assert.equal(applicationStepRequiresValidation('open'), true);
  assert.equal(applicationStepRequiresValidation('closed'), true);
});

test('a complete application passes server validation', () => {
  assert.equal(
    validateApplication(validApplication(), new Date('2026-08-26T12:00:00-04:00')),
    '',
  );

  const upperclassApplicant = validApplication();
  upperclassApplicant.set('academicStage', 'Senior');
  assert.equal(
    validateApplication(upperclassApplicant, new Date('2026-08-26T12:00:00-04:00')),
    '',
  );
});

test('all participation commitments are required', () => {
  const missingAdultConfirmation = validApplication();
  missingAdultConfirmation.delete('isAdult');
  assert.match(
    validateApplication(missingAdultConfirmation, new Date('2026-08-26T12:00:00-04:00')),
    /required participation/,
  );

  const missingSessionCommitment = validApplication();
  missingSessionCommitment.delete('individualSessionCommitment');
  assert.match(
    validateApplication(missingSessionCommitment, new Date('2026-08-26T12:00:00-04:00')),
    /required participation/,
  );

  const missingFeedbackCommitment = validApplication();
  missingFeedbackCommitment.delete('applyFirstCommitment');
  assert.match(
    validateApplication(missingFeedbackCommitment, new Date('2026-08-26T12:00:00-04:00')),
    /required participation/,
  );
});

test('application records preserve concise stage-one selection fields', () => {
  const record = applicationRecord(
    validApplication(),
    'application-test-id',
    'founding-cohort-2026/application-test-id.pdf',
  );
  assert.equal(record.graduationDate, '2029-05');
  assert.equal(record.graduationYear, '2029');
  assert.equal(record.academicStage, 'Sophomore');
  assert.deepEqual(record.rolesExploring, ['Software Engineering']);
  assert.deepEqual(record.obstacles, ['I am unsure what to prioritize']);
  assert.match(record.fallGoal, /opportunity pipeline/);
  assert.match(record.recentAction, /spreadsheet of internship deadlines/);
  assert.match(record.kellyQuestion, /biggest constraint/);
  assert.equal(record.communityCommitment, 1);
  assert.equal(record.conferenceInterest, 'Deciding which conference to pursue');
  assert.equal('betaInterest' in record, false);
  assert.equal(record.adultConfirmed, 1);
  assert.equal(record.termsVersion, '2026-fall-founding-cohort-v4');
  assert.equal(record.acknowledgementsAcceptedAt, record.submittedAt);
});

test('application option values are checked against server-side allowlists', () => {
  const invalidStage = validApplication();
  invalidStage.set('academicStage', 'Graduate student');
  assert.match(
    validateApplication(invalidStage, new Date('2026-08-26T12:00:00-04:00')),
    /valid Fall 2026 college-year/,
  );

  const invalidRole = validApplication();
  invalidRole.set('rolesExploring', 'Guaranteed job placement');
  assert.match(
    validateApplication(invalidRole, new Date('2026-08-26T12:00:00-04:00')),
    /valid role or path options/,
  );

  const invalidConferenceInterest = validApplication();
  invalidConferenceInterest.set('conferenceInterest', 'Only if admission is guaranteed');
  assert.match(
    validateApplication(invalidConferenceInterest, new Date('2026-08-26T12:00:00-04:00')),
    /valid conference-interest option/,
  );

});

test('conference interest and LinkedIn are required', () => {
  const missingInterest = validApplication();
  missingInterest.delete('conferenceInterest');
  assert.match(
    validateApplication(missingInterest, new Date('2026-08-26T12:00:00-04:00')),
    /Missing required field: conferenceInterest/,
  );

  const noLinkedIn = validApplication();
  noLinkedIn.delete('linkedInUrl');
  assert.match(
    validateApplication(noLinkedIn, new Date('2026-08-26T12:00:00-04:00')),
    /Missing required field: linkedInUrl/,
  );
});

test('applicants choose no more than two current obstacles', () => {
  const data = validApplication();
  data.append('obstacles', 'I find opportunities too late');
  data.append('obstacles', 'I do not know how to network');
  assert.match(
    validateApplication(data, new Date('2026-08-26T12:00:00-04:00')),
    /one or two current obstacles/,
  );
});

test('the three written responses require enough substance without becoming essays', () => {
  const tooShort = validApplication();
  tooShort.set('recentAction', 'I updated my resume yesterday.');
  assert.match(
    validateApplication(tooShort, new Date('2026-08-26T12:00:00-04:00')),
    /approximately 50–100 words/,
  );

  const tooLong = validApplication();
  tooLong.set('fallGoal', Array.from({ length: 151 }, () => 'goal').join(' '));
  assert.match(
    validateApplication(tooLong, new Date('2026-08-26T12:00:00-04:00')),
    /approximately 50–100 words/,
  );
});

test('resume uploads must be PDFs no larger than 5 MB', () => {
  const wrongType = validApplication();
  wrongType.set(
    'resume',
    testFile(
      'resume.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ),
  );
  assert.match(
    validateApplication(wrongType, new Date('2026-08-26T12:00:00-04:00')),
    /PDF/,
  );

  const tooLarge = validApplication();
  tooLarge.set(
    'resume',
    testFile('resume.pdf', 'application/pdf', maxResumeBytes + 1),
  );
  assert.match(
    validateApplication(tooLarge, new Date('2026-08-26T12:00:00-04:00')),
    /5 MB/,
  );
});

test('resume uploads must contain a PDF file signature', async () => {
  assert.equal(await validateResumeSignature(testFile()), '');

  const disguisedFile = new File(
    [new TextEncoder().encode('not a real PDF')],
    'resume.pdf',
    { type: 'application/pdf' },
  );
  assert.match(await validateResumeSignature(disguisedFile), /valid PDFs/);
});

test('application confirmation email is concise, branded, and safe', () => {
  const email = buildApplicationConfirmationEmail({
    fullName: '<Kelly> Applicant',
    email: 'applicant@example.com',
    reference: 'ABC12345',
  });

  assert.equal(email.to, 'applicant@example.com');
  assert.match(email.subject, /Application/);
  assert.match(email.text, /ABC12345/);
  assert.match(email.text, /September 3, 2026/);
  assert.match(email.text, /not an acceptance decision/);
  assert.match(email.html, /&lt;Kelly&gt;/);
  assert.doesNotMatch(email.html, /<Kelly>/);
});

test('application confirmation uses the Cloudflare Email Sending REST API', async () => {
  let request;
  const outcome = await sendApplicationConfirmation({
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'account-id',
      CLOUDFLARE_EMAIL_API_TOKEN: 'secret-token',
      CONFIRMATION_FROM_EMAIL: 'mentorship@kellychen.dev',
      CONFIRMATION_REPLY_TO: 'kelly@example.com',
    },
    fullName: 'Example Applicant',
    email: 'applicant@example.com',
    reference: 'ABC12345',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({
        success: true,
        errors: [],
        result: {
          delivered: ['applicant@example.com'],
          queued: [],
          permanent_bounces: [],
          message_id: 'message-id',
        },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
  });

  assert.equal(outcome.sent, true);
  assert.equal(outcome.status, 'delivered');
  assert.match(request.url, /accounts\/account-id\/email\/sending\/send$/);
  assert.equal(request.options.headers.Authorization, 'Bearer secret-token');
  const payload = JSON.parse(request.options.body);
  assert.equal(payload.from.address, 'mentorship@kellychen.dev');
  assert.equal(payload.reply_to, 'kelly@example.com');
  assert.ok(payload.html);
  assert.ok(payload.text);
});

test('missing email configuration does not invalidate a saved application', async () => {
  const outcome = await sendApplicationConfirmation({
    env: {},
    fullName: 'Example Applicant',
    email: 'applicant@example.com',
    reference: 'ABC12345',
  });

  assert.equal(outcome.sent, false);
  assert.equal(outcome.status, 'not_configured');
  assert.match(outcome.error, /Missing email configuration/);
});

test('submission guard accepts a human-paced same-origin form and rejects traps', () => {
  const now = Date.now();
  const request = new Request(
    'https://recruiting-accelerator-apply.pages.dev/api/applications',
    {
      method: 'POST',
      headers: {
        Origin: 'https://recruiting-accelerator-apply.pages.dev',
        'Sec-Fetch-Site': 'same-origin',
      },
    },
  );
  const formData = new FormData();
  formData.set('formStartedAt', String(now - 10_000));
  formData.set('website', '');
  assert.equal(validateSubmissionGuard(request, formData, now), '');

  const trapped = new FormData();
  trapped.set('formStartedAt', String(now - 10_000));
  trapped.set('website', 'https://spam.example');
  assert.match(validateSubmissionGuard(request, trapped, now), /could not be verified/);

  const tooFast = new FormData();
  tooFast.set('formStartedAt', String(now));
  assert.match(validateSubmissionGuard(request, tooFast, now), /could not be verified/);
});

test('owner notification summarizes a saved application and replies to the student', async () => {
  const application = applicationRecord(
    validApplication(),
    'application-test-id',
    'founding-cohort-2026/application-test-id.pdf',
  );
  const email = buildOwnerApplicationNotificationEmail({
    application,
    reference: 'ABC12345',
  });
  assert.match(email.subject, /New Recruiting Season Accelerator Application/);
  assert.match(email.text, /ABC12345/);
  assert.match(email.text, /Example Applicant/);
  assert.match(email.text, /founding-cohort-2026\/application-test-id\.pdf/);
  assert.equal(email.reply_to, 'applicant@example.com');

  let payload;
  const outcome = await sendOwnerApplicationNotification({
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'account-id',
      CLOUDFLARE_EMAIL_API_TOKEN: 'secret-token',
      CONFIRMATION_FROM_EMAIL: 'mentorship@kellychen.dev',
      CONFIRMATION_REPLY_TO: 'kelly@example.com',
      OWNER_NOTIFY_EMAIL: 'owner@example.com',
    },
    application,
    reference: 'ABC12345',
    fetchImpl: async (url, options) => {
      payload = JSON.parse(options.body);
      return new Response(JSON.stringify({
        success: true,
        errors: [],
        result: {
          delivered: ['owner@example.com'],
          queued: [],
          permanent_bounces: [],
        },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
  });
  assert.equal(outcome.sent, true);
  assert.equal(payload.to, 'owner@example.com');
  assert.equal(payload.reply_to, 'applicant@example.com');
  assert.equal(payload.from.address, 'mentorship@kellychen.dev');
});

test('a complete future cohort interest form passes validation', () => {
  assert.equal(validateFutureInterest(validFutureInterest()), '');
});

test('future cohort interest requires a valid email and explicit announcement consent', () => {
  const invalidEmail = validFutureInterest();
  invalidEmail.set('email', 'not-an-email');
  assert.match(validateFutureInterest(invalidEmail), /valid email/);

  const missingConsent = validFutureInterest();
  missingConsent.delete('announcementConsent');
  assert.match(validateFutureInterest(missingConsent), /future cohort announcements/);

  const invalidGraduationYear = validFutureInterest();
  invalidGraduationYear.set('graduationYear', '9999');
  assert.match(validateFutureInterest(invalidGraduationYear), /between 2026 and 2035/);

  const invalidOpportunity = validFutureInterest();
  invalidOpportunity.set('opportunityInterest', 'Guaranteed job placement');
  assert.match(validateFutureInterest(invalidOpportunity), /valid opportunity interest/);
});

test('future cohort records normalize email and preserve only the intended fields', () => {
  const data = validFutureInterest();
  data.set('email', '  FUTURE@EXAMPLE.COM ');
  const record = futureInterestRecord(
    data,
    'interest-test-id',
    new Date('2026-07-19T12:00:00-04:00'),
  );

  assert.equal(record.id, 'interest-test-id');
  assert.equal(record.email, 'future@example.com');
  assert.equal(record.announcementConsent, 1);
  assert.equal(record.supportNote, 'I would like help improving interview conversion.');
});

test('the Cloudflare microsite contains details, both forms, and policy navigation', async () => {
  const [landing, application, chrome] = await Promise.all([
    readFile(landingSourceUrl, 'utf8'),
    readFile(applicationSourceUrl, 'utf8'),
    readFile(chromeSourceUrl, 'utf8'),
  ]);

  assert.match(landing, /Build a Smarter/);
  assert.match(landing, /75-Minute Live Workshops and Q&amp;As/);
  assert.match(landing, /One-Hour Strategy Session/);
  assert.match(landing, /September 14–December 15/);
  assert.match(landing, /one monthly group check-in/);
  assert.match(landing, /unlimited Slack or direct-message support/);
  assert.match(landing, /Free Fall 2026 Founding Cohort/);
  assert.doesNotMatch(landing, /at least five freshmen or sophomores/);
  assert.doesNotMatch(application, /name="betaInterest"/);
  assert.match(landing, /Participant Terms/);
  assert.match(application, /path === '\/apply'/);
  assert.match(application, /<ApplicationPage/);
  assert.match(application, /path === '\/interest'/);
  assert.match(application, /<FutureInterestPage/);
  assert.match(application, /fetch\('\/api\/interest'/);
  assert.match(application, /<SubmissionGuardFields \/>/);
  assert.doesNotMatch(application, /turnstile/i);
  assert.match(chrome, /href="\/terms"/);
  assert.match(chrome, /href="\/privacy"/);
  assert.match(chrome, /href="\/refund"/);
  assert.doesNotMatch(
    `${landing}${application}${chrome}`,
    /kelly-recruiting-accelerator\.kellychenmeiyi\.chatgpt\.site/,
  );
});
