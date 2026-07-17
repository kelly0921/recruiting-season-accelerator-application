import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getApplicationState,
  maxResumeBytes,
  validateApplication,
} from '../functions/_shared/validation.js';

const testFile = (
  name = 'resume.pdf',
  type = 'application/pdf',
  size = 1024,
) => new File([new Uint8Array(size)], name, { type });

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
    currentExperience: 'Applied before but received few responses',
    recruitingHistory: 'Applied to internships and revised my resume.',
    threeMonthGoal: 'Earn stronger interview conversion.',
    primaryObstacle: 'Unclear positioning.',
    worthwhileChange: 'A focused recruiting system.',
    feedbackPriority: 'Resume positioning.',
    programFit: 'I am ready to act on direct feedback.',
    referralSource: "Kelly's LinkedIn post",
  };
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  data.append('opportunities', 'Software engineering internship');
  data.append('companyEnvironments', 'Fintech');
  data.append('desiredSupport', 'Resume positioning');
  [
    'isAdult',
    'attendWorkshops',
    'completeWork',
    'submitFeedback',
    'understandPrice',
    'understandNoGuarantee',
    'understandSelection',
    'understandIndependence',
  ].forEach((key) => data.set(key, 'yes'));
  data.set('resume', testFile());
  return data;
}

test('application dates enforce the 2026 ET window', () => {
  assert.equal(getApplicationState(new Date('2026-07-21T23:00:00-04:00')), 'opening-soon');
  assert.equal(getApplicationState(new Date('2026-07-22T00:00:00-04:00')), 'open');
  assert.equal(getApplicationState(new Date('2026-08-02T23:59:59-04:00')), 'open');
  assert.equal(getApplicationState(new Date('2026-08-03T00:00:00-04:00')), 'closed');
});

test('a complete application passes server validation', () => {
  assert.equal(
    validateApplication(validApplication(), new Date('2026-07-25T12:00:00-04:00')),
    '',
  );
});

test('support choices are limited to three', () => {
  const data = validApplication();
  data.append('desiredSupport', 'Application strategy');
  data.append('desiredSupport', 'Career direction');
  data.append('desiredSupport', 'Recruiting accountability');
  assert.match(
    validateApplication(data, new Date('2026-07-25T12:00:00-04:00')),
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
    validateApplication(wrongType, new Date('2026-07-25T12:00:00-04:00')),
    /PDF/,
  );

  const tooLarge = validApplication();
  tooLarge.set(
    'resume',
    testFile('resume.pdf', 'application/pdf', maxResumeBytes + 1),
  );
  assert.match(
    validateApplication(tooLarge, new Date('2026-07-25T12:00:00-04:00')),
    /5 MB/,
  );
});
