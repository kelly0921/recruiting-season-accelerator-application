export const applicationOpenAt = '2026-07-22T00:00:00-04:00';
export const applicationCloseAt = '2026-08-02T23:59:59-04:00';
export const maxResumeBytes = 5 * 1024 * 1024;

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
  'primaryObstacle',
  'worthwhileChange',
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

  const email = String(formData.get('email'));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address.';
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
    recruitingHistory: String(formData.get('recruitingHistory')).trim(),
    threeMonthGoal: String(formData.get('threeMonthGoal')).trim(),
    primaryObstacle: String(formData.get('primaryObstacle')).trim(),
    worthwhileChange: String(formData.get('worthwhileChange')).trim(),
    feedbackPriority: String(formData.get('feedbackPriority')).trim(),
    programFit: String(formData.get('programFit')).trim(),
    desiredSupport: formData.getAll('desiredSupport'),
    referralSource: String(formData.get('referralSource')).trim(),
    marketingConsent: formData.get('marketingConsent') === 'yes' ? 1 : 0,
  };
}

