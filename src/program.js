export const program = Object.freeze({
  name: 'Recruiting Season Accelerator',
  contactEmail: 'kellychenmeiyi@gmail.com',
  portfolioUrl: 'https://kellychen.dev/',
  applicationOpenAt: '2026-08-23T00:00:00-04:00',
  applicationCloseAt: '2026-09-01T23:59:59-04:00',
  applicationDates: 'August 23–September 1, 2026',
  decisionDates: 'September 3, 2026',
  startDate: 'September 14, 2026',
  intensiveDates: 'September 14–October 11, 2026',
  researchEndDate: 'November 30, 2026',
  price: 0,
  capacity: 8,
  alternateCapacity: 2,
  betaCapacity: 7,
  totalTesterCapacity: 15,
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
