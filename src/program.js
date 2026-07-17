export const program = Object.freeze({
  name: 'Recruiting Season Accelerator',
  contactEmail: 'kellychenmeiyi@gmail.com',
  portfolioUrl: 'https://kelly-recruiting-accelerator.kellychenmeiyi.chatgpt.site/',
  applicationOpenAt: '2026-07-22T00:00:00-04:00',
  applicationCloseAt: '2026-08-02T23:59:59-04:00',
  applicationDates: 'July 22–August 2, 2026',
  decisionDates: 'August 3–5, 2026',
  startDate: 'Week of August 10, 2026',
  price: 99,
  feedbackCredit: 20,
  capacity: 6,
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
  return { label: 'Applications Are Closed', href: '/apply' };
}
