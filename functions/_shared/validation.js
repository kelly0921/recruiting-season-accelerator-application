import {
  academicStageOptions,
  betaInterestOptions,
  conferenceInterestOptions,
  obstacleOptions,
  opportunityOptions,
  participantTermsVersion,
  preferredTimingOptions,
  rolePathOptions,
} from '../../shared/applicationOptions.js';

export const applicationOpenAt = '2026-08-23T00:00:00-04:00';
export const applicationCloseAt = '2026-09-01T23:59:59-04:00';
export const maxResumeBytes = 5 * 1024 * 1024;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requiredTextFields = [
  'fullName',
  'email',
  'school',
  'major',
  'graduationDate',
  'academicStage',
  'fallGoal',
  'recentAction',
  'kellyQuestion',
  'conferenceInterest',
  'betaInterest',
];

const requiredConfirmations = [
  'groupSessionCommitment',
  'individualSessionCommitment',
  'weeklyWorkCommitment',
  'applyFirstCommitment',
  'programAcknowledgement',
  'termsAcknowledgement',
];

const isAllowed = (value, options) => options.includes(String(value || '').trim());

function allAllowed(values, options) {
  return values.length === new Set(values).size
    && values.every((value) => isAllowed(value, options));
}

export function getApplicationState(now = new Date()) {
  if (now < new Date(applicationOpenAt)) return 'opening-soon';
  if (now > new Date(applicationCloseAt)) return 'closed';
  return 'open';
}

export function validateApplication(formData, now = new Date()) {
  if (getApplicationState(now) !== 'open') {
    return 'Applications are not currently accepting submissions.';
  }

  for (const field of requiredTextFields) {
    if (!String(formData.get(field) || '').trim()) {
      return `Missing required field: ${field}.`;
    }
  }

  const email = String(formData.get('email')).trim();
  if (!emailPattern.test(email)) {
    return 'Enter a valid email address.';
  }

  const graduationDate = String(formData.get('graduationDate')).trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(graduationDate)) {
    return 'Enter your expected graduation month and year.';
  }
  const graduationYear = Number(graduationDate.slice(0, 4));
  if (graduationYear < 2026 || graduationYear > 2032) {
    return 'Enter an expected graduation date between 2026 and 2032.';
  }

  const lengthLimits = {
    fullName: 120,
    email: 254,
    school: 200,
    major: 200,
    graduationDate: 7,
    academicStage: 80,
    linkedInUrl: 500,
    fallGoal: 1200,
    recentAction: 1200,
    kellyQuestion: 1200,
    conferenceInterest: 120,
    betaInterest: 120,
  };

  for (const [field, maxLength] of Object.entries(lengthLimits)) {
    if (String(formData.get(field) || '').trim().length > maxLength) {
      return `${field} is too long.`;
    }
  }

  for (const field of ['fallGoal', 'recentAction', 'kellyQuestion']) {
    const wordCount = String(formData.get(field) || '').trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 20 || wordCount > 150) {
      return `${field} should be a short paragraph. Aim for approximately 50–100 words.`;
    }
  }

  const linkedInUrl = String(formData.get('linkedInUrl') || '').trim();
  if (linkedInUrl) {
    try {
      const url = new URL(linkedInUrl);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return 'linkedInUrl must be a valid web address.';
      }
    } catch {
      return 'linkedInUrl must be a valid web address.';
    }
  }

  if (!isAllowed(formData.get('academicStage'), academicStageOptions)) {
    return 'Choose a valid Fall 2026 class-year and age option.';
  }
  if (!isAllowed(formData.get('conferenceInterest'), conferenceInterestOptions)) {
    return 'Choose a valid conference-interest option.';
  }
  if (!isAllowed(formData.get('betaInterest'), betaInterestOptions)) {
    return 'Choose a valid extended-beta preference.';
  }
  const rolesExploring = formData.getAll('rolesExploring').map(String);
  if (!rolesExploring.length) {
    return 'Choose at least one role or path.';
  }
  if (!allAllowed(rolesExploring, rolePathOptions)) {
    return 'Choose only valid role or path options.';
  }

  const obstacles = formData.getAll('obstacles').map(String);
  if (!obstacles.length || obstacles.length > 2) {
    return 'Choose one or two current obstacles.';
  }
  if (!allAllowed(obstacles, obstacleOptions)) {
    return 'Choose only valid obstacle options.';
  }

  for (const field of requiredConfirmations) {
    if (formData.get(field) !== 'yes') {
      return 'Complete all required participation and program confirmations.';
    }
  }

  const resume = formData.get('resume');
  if (!resume || typeof resume === 'string' || !resume.size) {
    return 'Upload your resume as a PDF.';
  }
  if (resume.size > maxResumeBytes) {
    return 'Resume files must be 5 MB or smaller.';
  }
  if (resume.type !== 'application/pdf' && !resume.name.toLowerCase().endsWith('.pdf')) {
    return 'Resume files must be PDFs.';
  }

  return '';
}

export async function validateResumeSignature(resume) {
  if (!resume || typeof resume === 'string' || resume.size < 5) {
    return 'Resume files must be valid PDFs.';
  }

  const header = new Uint8Array(await resume.slice(0, 5).arrayBuffer());
  const signature = String.fromCharCode(...header);
  return signature === '%PDF-' ? '' : 'Resume files must be valid PDFs.';
}

export function applicationRecord(formData, id, resumeKey, now = new Date()) {
  const submittedAt = now.toISOString();
  const graduationDate = String(formData.get('graduationDate')).trim();
  const academicStage = String(formData.get('academicStage')).trim();
  const rolesExploring = formData.getAll('rolesExploring');
  const obstacles = formData.getAll('obstacles');
  const fallGoal = String(formData.get('fallGoal')).trim();
  const recentAction = String(formData.get('recentAction')).trim();
  const kellyQuestion = String(formData.get('kellyQuestion')).trim();
  return {
    id,
    submittedAt,
    status: 'New',
    fullName: String(formData.get('fullName')).trim(),
    email: String(formData.get('email')).trim().toLowerCase(),
    school: String(formData.get('school')).trim(),
    major: String(formData.get('major')).trim(),
    graduationDate,
    graduationYear: graduationDate.slice(0, 4),
    academicStage,
    timeZone: '',
    linkedInUrl: String(formData.get('linkedInUrl') || '').trim(),
    portfolioUrl: '',
    resumeKey,
    resumeOriginalName: formData.get('resume').name,
    rolesExploring,
    opportunities: rolesExploring,
    companyEnvironments: [],
    recruitingMarket: '',
    targetList: '',
    conferenceInterest: String(formData.get('conferenceInterest')).trim(),
    conferenceDetails: '',
    fallGoal,
    obstacles,
    recentAction,
    kellyQuestion,
    currentExperience: academicStage,
    applicationsSubmitted: 0,
    firstInterviews: 0,
    finalRounds: 0,
    offersReceived: 0,
    recruitingHistory: recentAction,
    threeMonthGoal: fallGoal,
    primaryObstacle: obstacles.join('; '),
    worthwhileChange: kellyQuestion,
    feedbackPriority: kellyQuestion,
    programFit: recentAction,
    schedulingConstraints: '',
    betaInterest: String(formData.get('betaInterest')).trim(),
    desiredSupport: obstacles,
    referralSource: '',
    marketingConsent: 0,
    communityCommitment: 1,
    adultConfirmed: academicStage === 'Freshman and 18 or Older'
      || academicStage === 'Sophomore and 18 or Older'
      ? 1
      : 0,
    acknowledgementsAcceptedAt: submittedAt,
    termsVersion: participantTermsVersion,
  };
}

export function validateFutureInterest(formData) {
  for (const field of [
    'fullName',
    'email',
    'graduationYear',
    'opportunityInterest',
  ]) {
    if (!String(formData.get(field) || '').trim()) {
      return `Missing required field: ${field}.`;
    }
  }

  const email = String(formData.get('email')).trim();
  if (!emailPattern.test(email)) {
    return 'Enter a valid email address.';
  }

  const graduationYear = String(formData.get('graduationYear')).trim();
  const graduationYearNumber = Number(graduationYear);
  if (!Number.isInteger(graduationYearNumber)
    || graduationYearNumber < 2026
    || graduationYearNumber > 2035) {
    return 'Enter an expected graduation year between 2026 and 2035.';
  }

  const lengthLimits = {
    fullName: 120,
    email: 254,
    school: 200,
    graduationYear: 4,
    opportunityInterest: 120,
    preferredTiming: 120,
    supportNote: 1000,
  };

  for (const [field, maxLength] of Object.entries(lengthLimits)) {
    if (String(formData.get(field) || '').trim().length > maxLength) {
      return `${field} is too long.`;
    }
  }

  if (!isAllowed(formData.get('opportunityInterest'), opportunityOptions)) {
    return 'Choose a valid opportunity interest.';
  }

  const preferredTiming = String(formData.get('preferredTiming') || '').trim();
  if (preferredTiming && !isAllowed(preferredTiming, preferredTimingOptions)) {
    return 'Choose a valid preferred cohort timing.';
  }

  if (formData.get('announcementConsent') !== 'yes') {
    return 'Confirm that you would like to receive future cohort announcements.';
  }

  return '';
}

export function futureInterestRecord(formData, id, now = new Date()) {
  return {
    id,
    submittedAt: now.toISOString(),
    fullName: String(formData.get('fullName')).trim(),
    email: String(formData.get('email')).trim().toLowerCase(),
    school: String(formData.get('school') || '').trim(),
    graduationYear: String(formData.get('graduationYear')).trim(),
    opportunityInterest: String(formData.get('opportunityInterest')).trim(),
    preferredTiming: String(formData.get('preferredTiming') || '').trim(),
    supportNote: String(formData.get('supportNote') || '').trim(),
    announcementConsent: 1,
  };
}
