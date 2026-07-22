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
    graduationYear: '2027',
    timeZone: 'Eastern Time',
    linkedInUrl: 'https://linkedin.com/in/example',
    recruitingMarket: 'Primarily U.S.-Based Roles',
    targetList: 'Stripe SWE internship, Bloomberg SWE internship, and fintech programs.',
    currentExperience: 'Applied before but received few responses',
    applicationsSubmitted: '85',
    firstInterviews: '5',
    finalRounds: '2',
    offersReceived: '0',
    recruitingHistory: 'I applied to internships, revised my resume, and saw limited interview conversion.',
    threeMonthGoal: 'Earn stronger interview conversion and leave with a focused recruiting system.',
    feedbackPriority: 'I want specific feedback on my resume positioning.',
    programFit: 'After weak response rates, I narrowed my target list and rewrote my project bullets around outcomes.',
    schedulingConstraints: 'Weekday evenings are easiest for me.',
    referralSource: "Kelly's LinkedIn post",
  };
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  data.append('opportunities', 'Software Engineering Internship');
  data.append('companyEnvironments', 'Fintech');
  data.append('desiredSupport', 'Resume Positioning');
  [
    'isAdult',
    'participationCommitment',
    'feedbackCommunityCommitment',
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

test('application dates enforce the 2026 ET window', () => {
  assert.equal(getApplicationState(new Date('2026-07-23T23:00:00-04:00')), 'opening-soon');
  assert.equal(getApplicationState(new Date('2026-07-24T00:00:00-04:00')), 'open');
  assert.equal(getApplicationState(new Date('2026-07-30T23:59:59-04:00')), 'open');
  assert.equal(getApplicationState(new Date('2026-07-31T00:00:00-04:00')), 'closed');
});

test('the pre-launch application can be browsed without field validation', () => {
  assert.equal(applicationStepRequiresValidation('opening-soon'), false);
  assert.equal(applicationStepRequiresValidation('open'), true);
  assert.equal(applicationStepRequiresValidation('closed'), true);
});

test('a complete application passes server validation', () => {
  assert.equal(
    validateApplication(validApplication(), new Date('2026-07-26T12:00:00-04:00')),
    '',
  );
});

test('recruiting funnel metrics and consolidated commitments are required', () => {
  const invalidMetrics = validApplication();
  invalidMetrics.set('firstInterviews', '-1');
  assert.match(
    validateApplication(invalidMetrics, new Date('2026-07-26T12:00:00-04:00')),
    /whole number/,
  );

  const missingCommunity = validApplication();
  missingCommunity.delete('feedbackCommunityCommitment');
  assert.match(
    validateApplication(missingCommunity, new Date('2026-07-26T12:00:00-04:00')),
    /required availability/,
  );
});

test('application records preserve the structured funnel snapshot', () => {
  const record = applicationRecord(
    validApplication(),
    'application-test-id',
    'founding-cohort-2026/application-test-id.pdf',
  );
  assert.equal(record.applicationsSubmitted, 85);
  assert.equal(record.firstInterviews, 5);
  assert.equal(record.finalRounds, 2);
  assert.equal(record.offersReceived, 0);
  assert.equal(record.communityCommitment, 1);
  assert.equal(record.recruitingMarket, 'Primarily U.S.-Based Roles');
  assert.match(record.targetList, /Stripe/);
  assert.equal(record.adultConfirmed, 1);
  assert.equal(record.termsVersion, '2026-founding-cohort-v1');
  assert.equal(record.acknowledgementsAcceptedAt, record.submittedAt);
});

test('application option values are checked against server-side allowlists', () => {
  const invalidMarket = validApplication();
  invalidMarket.set('recruitingMarket', 'Anywhere with guaranteed sponsorship');
  assert.match(
    validateApplication(invalidMarket, new Date('2026-07-26T12:00:00-04:00')),
    /valid recruiting market/,
  );

  const invalidSupport = validApplication();
  invalidSupport.set('desiredSupport', 'Guaranteed referral');
  assert.match(
    validateApplication(invalidSupport, new Date('2026-07-26T12:00:00-04:00')),
    /valid support areas/,
  );
});

test('support choices are limited to three', () => {
  const data = validApplication();
  data.append('desiredSupport', 'Application Strategy');
  data.append('desiredSupport', 'Career Direction');
  data.append('desiredSupport', 'Recruiting Accountability');
  assert.match(
    validateApplication(data, new Date('2026-07-26T12:00:00-04:00')),
    /between one and three/,
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
    validateApplication(wrongType, new Date('2026-07-26T12:00:00-04:00')),
    /PDF/,
  );

  const tooLarge = validApplication();
  tooLarge.set(
    'resume',
    testFile('resume.pdf', 'application/pdf', maxResumeBytes + 1),
  );
  assert.match(
    validateApplication(tooLarge, new Date('2026-07-26T12:00:00-04:00')),
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

  assert.match(landing, /Recruiting Season Is Here/);
  assert.match(landing, /Weekly Workshops/);
  assert.match(landing, /Private Sessions/);
  assert.match(landing, /Participant Terms/);
  assert.match(application, /path === '\/apply'/);
  assert.match(application, /<ApplicationPage/);
  assert.match(application, /path === '\/interest'/);
  assert.match(application, /<FutureInterestPage/);
  assert.match(application, /fetch\('\/api\/interest'/);
  assert.match(chrome, /href="\/terms"/);
  assert.match(chrome, /href="\/privacy"/);
  assert.match(chrome, /href="\/refund"/);
  assert.doesNotMatch(
    `${landing}${application}${chrome}`,
    /kelly-recruiting-accelerator\.kellychenmeiyi\.chatgpt\.site/,
  );
});
