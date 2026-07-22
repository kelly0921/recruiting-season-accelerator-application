export const program = Object.freeze({
  name: 'Recruiting Season Accelerator',
  contactEmail: 'kellychenmeiyi@gmail.com',
  portfolioUrl: 'https://kellychen.dev/',
  applicationOpenAt: '2026-07-24T00:00:00-04:00',
  applicationCloseAt: '2026-07-30T23:59:59-04:00',
  applicationDates: 'July 24–30, 2026 · Rolling',
  decisionDates: 'Rolling · Final Decisions by July 31',
  startDate: 'August 1, 2026 · Tentative',
  price: 99,
  feedbackCredit: 20,
  capacity: 8,
});

export function applicationState(now = new Date()) {
  if (now < new Date(program.applicationOpenAt)) return 'opening-soon';
  if (now > new Date(program.applicationCloseAt)) return 'closed';
  return 'open';
}

export function applicationAction(state = applicationState()) {
  if (state === 'open') {
    return { label: 'Apply for the Founding Cohort', href: '/apply' };
  }
  if (state === 'opening-soon') {
    return { label: 'Preview the Application', href: '/apply' };
  }
  return { label: 'Join the Future Cohort List', href: '/interest' };
}

export function applicationStepRequiresValidation(state = applicationState()) {
  return state !== 'opening-soon';
}
