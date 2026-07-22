export const applicationOpenAt = '2026-07-24T00:00:00-04:00';
export const applicationCloseAt = '2026-07-30T23:59:59-04:00';
export const maxResumeBytes = 5 * 1024 * 1024;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requiredTextFields = [
  'fullName',
  'email',
  'school',
  'major',
  'graduationYear',
  'timeZone',
  'linkedInUrl',
  'currentExperience',
  'recruitingHistory',
  'threeMonthGoal',
  'feedbackPriority',
  'programFit',
  'referralSource',
];

const requiredConfirmations = [
  'isAdult',
  'attendWorkshops',
  'completeWork',
  'submitFeedback',
  'understandPrice',
  'understandNoGuarantee',
  'understandSelection',
  'understandIndependence',
  'communityCommitment',
];

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

  const graduationYear = Number(String(formData.get('graduationYear')).trim());
  if (!Number.isInteger(graduationYear) || graduationYear < 2026 || graduationYear > 2032) {
    return 'Enter an expected graduation year between 2026 and 2032.';
  }

  const lengthLimits = {
    fullName: 120,
    email: 254,
    school: 200,
    major: 200,
    timeZone: 80,
    linkedInUrl: 500,
    portfolioUrl: 500,
    currentExperience: 200,
    recruitingHistory: 2000,
    threeMonthGoal: 1500,
    feedbackPriority: 1200,
    programFit: 1500,
    schedulingConstraints: 800,
    referralSource: 120,
  };

  for (const [field, maxLength] of Object.entries(lengthLimits)) {
    if (String(formData.get(field) || '').trim().length > maxLength) {
      return `${field} is too long.`;
    }
  }

  const minimumLengths = {
    recruitingHistory: 30,
    threeMonthGoal: 30,
    feedbackPriority: 15,
    programFit: 30,
  };

  for (const [field, minLength] of Object.entries(minimumLengths)) {
    if (String(formData.get(field) || '').trim().length < minLength) {
      return `${field} needs a little more detail.`;
    }
  }

  for (const field of [
    'applicationsSubmitted',
    'firstInterviews',
    'finalRounds',
    'offersReceived',
  ]) {
    const value = String(formData.get(field) || '').trim();
    if (!/^\d+$/.test(value) || Number(value) > 5000) {
      return 'Enter a whole number between 0 and 5,000 for each recruiting-funnel field.';
    }
  }

  for (const field of ['linkedInUrl', 'portfolioUrl']) {
    const value = String(formData.get(field) || '').trim();
    if (value) {
      try {
        const url = new URL(value);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          return `${field} must be a valid web address.`;
        }
      } catch {
        return `${field} must be a valid web address.`;
      }
    }
  }

  if (!formData.getAll('opportunities').length) {
    return 'Choose at least one opportunity.';
  }
  if (!formData.getAll('companyEnvironments').length) {
    return 'Choose at least one company environment.';
  }

  const desiredSupport = formData.getAll('desiredSupport');
  if (!desiredSupport.length || desiredSupport.length > 3) {
    return 'Choose between one and three desired support areas.';
  }

  for (const field of requiredConfirmations) {
    if (formData.get(field) !== 'yes') {
      return 'Complete all required availability and program confirmations.';
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

export function applicationRecord(formData, id, resumeKey, now = new Date()) {
  return {
    id,
    submittedAt: now.toISOString(),
    status: 'New',
    fullName: String(formData.get('fullName')).trim(),
    email: String(formData.get('email')).trim().toLowerCase(),
    school: String(formData.get('school')).trim(),
    major: String(formData.get('major')).trim(),
    graduationYear: String(formData.get('graduationYear')).trim(),
    timeZone: String(formData.get('timeZone')).trim(),
    linkedInUrl: String(formData.get('linkedInUrl')).trim(),
    portfolioUrl: String(formData.get('portfolioUrl') || '').trim(),
    resumeKey,
    resumeOriginalName: formData.get('resume').name,
    opportunities: formData.getAll('opportunities'),
    companyEnvironments: formData.getAll('companyEnvironments'),
    currentExperience: String(formData.get('currentExperience')).trim(),
    applicationsSubmitted: Number(formData.get('applicationsSubmitted')),
    firstInterviews: Number(formData.get('firstInterviews')),
    finalRounds: Number(formData.get('finalRounds')),
    offersReceived: Number(formData.get('offersReceived')),
    recruitingHistory: String(formData.get('recruitingHistory')).trim(),
    threeMonthGoal: String(formData.get('threeMonthGoal')).trim(),
    primaryObstacle: String(formData.get('recruitingHistory')).trim(),
    worthwhileChange: String(formData.get('threeMonthGoal')).trim(),
    feedbackPriority: String(formData.get('feedbackPriority')).trim(),
    programFit: String(formData.get('programFit')).trim(),
    schedulingConstraints: String(formData.get('schedulingConstraints') || '').trim(),
    desiredSupport: formData.getAll('desiredSupport'),
    referralSource: String(formData.get('referralSource')).trim(),
    marketingConsent: formData.get('marketingConsent') === 'yes' ? 1 : 0,
    communityCommitment: 1,
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
  if (!/^\d{4}$/.test(graduationYear)) {
    return 'Enter a valid four-digit graduation year.';
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
