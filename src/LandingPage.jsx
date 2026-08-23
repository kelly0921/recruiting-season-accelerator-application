import React, { useEffect } from 'react';
import { applicationAction, applicationState, program } from './program.js';
import { ProgramFooter, ProgramHeader } from './siteChrome.jsx';

const bottlenecks = [
  ['Opportunity Discovery', 'You know opportunities exist, but you often find them too late or do not know where to look.'],
  ['Prioritization', 'Internships, programs, conferences, and projects all compete for attention—without a clear order.'],
  ['Positioning', 'You have projects, coursework, leadership, or work experience, but your resume does not show the full value.'],
  ['Access and Follow-Through', 'You want to make events and new connections useful without defaulting to generic networking advice.'],
];

const included = [
  ['4', 'Live Workshops and Q&As', 'Four 75-minute working sessions tailored to the cohort, with frameworks, guided exercises, and focused hot seats.'],
  ['1', 'Live Resume Review', 'One 60-minute session to identify the strongest evidence and highest-impact changes in your current resume.'],
  ['1', 'Individual Strategy Session', 'One 60-minute mentorship session focused on your primary bottleneck, priorities, and next steps.'],
  ['1', 'Offline Resume Re-Review', 'One bounded follow-up review after you implement the initial feedback—not an unlimited revision cycle.'],
  ['Fall', 'ApplyFirst and Playbook Access', 'Continue using ApplyFirst, the conference playbook, and cohort resources through December 15.'],
  ['60', 'Days of Direction', 'Build a personalized 60-day plan during the intensive, then refine it during the fall check-ins.'],
];

const journey = [
  ['Week 1 · Sep 14–20', 'Opportunity Strategy', 'Clarify which early-career opportunities deserve attention and begin using ApplyFirst as a fall pipeline.'],
  ['Week 2 · Sep 21–27', 'Early-Career Positioning', 'Strengthen how projects, coursework, leadership, and work experience support the opportunities you are pursuing.'],
  ['Week 3 · Sep 28–Oct 4', 'Conferences and Networking', 'Connect conferences, career fairs, company events, and professional relationships to a broader fall strategy.'],
  ['Week 4 · Oct 5–11', 'Recruiting Execution', 'Prioritize next steps and build a personalized 60-day plan for continuing after the intensive.'],
];

const semesterMilestones = [
  ['October', 'Progress and ApplyFirst Check-In', 'Review early progress, ApplyFirst usage, and the first adjustments to your 60-day plan.'],
  ['November', 'Recruiting and Conference Check-In', 'Discuss recruiting patterns, conference experiences, and the next decisions that need context.'],
  ['December 15', 'Semester Closeout', 'Capture what worked, what changed, and the strategy you will carry into the next recruiting cycle.'],
];

const outcomes = [
  'A Personalized Fall Opportunity Strategy',
  'Resume Feedback With One Bounded Re-Review',
  'Early ApplyFirst and Conference Playbook Access',
  'Guidance for Conferences or Other Recruiting Events When Relevant',
  'A Personalized 60-Day Action Plan',
  'Clearer Priorities and Next Steps',
];

export const faqs = [
  {
    question: 'Who Is the Program Designed For?',
    answer:
      'Current college students from every class year may apply if they will be at least 18 when the program begins. The mentorship cohort will lean toward freshmen and sophomores because they are ApplyFirst’s core audience, while juniors and seniors whose needs fit may also be selected. The program primarily supports software engineering and related technology paths. Previous internship experience is not required, but mentorship applicants need a basic resume and must be ready to act on feedback.',
  },
  {
    question: 'Is This a Coding or Technical Interview Course?',
    answer:
      'No. The program focuses on recruiting strategy, positioning, target selection, organization, storytelling, networking, behavioral preparation, and diagnosing low response or conversion patterns.',
  },
  {
    question: 'What Is the Fall-Semester Commitment and Workshop Schedule?',
    answer:
      'The fall-semester cohort runs September 14–December 15. From September 14–October 11, the four-week intensive requires approximately one to two hours per week, plus one 60-minute resume review and one 60-minute strategy session. Participants should attend at least three of four virtual workshops; final live times will be selected based on accepted participants’ availability. From October 12–December 15, participants attend one monthly group check-in and complete a short ApplyFirst feedback prompt approximately every two weeks, with conference feedback requested around actual event dates when relevant. Weekly workshops and guaranteed individual sessions end after the intensive.',
  },
  {
    question: 'Do I Need to Be Attending a Conference?',
    answer:
      'No. The cohort will intentionally include students who are registered, applying or seeking funding, deciding which event to pursue, and not attending one this fall. The same playbook can support career fairs, hackathons, company programs, and other recruiting events.',
  },
  {
    question: 'What Is the Difference Between the Mentorship Cohort and the Extended Beta?',
    answer:
      `Eight founding mentees receive four workshops, a live resume review, one offline resume re-review, a strategy session, ApplyFirst and conference-playbook access, a personalized 60-day plan, monthly October–December check-ins, and continued cohort-resource access through December 15. Up to ${program.betaCapacity} beta-only participants from any college year receive early ApplyFirst access, conference-playbook access when relevant, and short feedback prompts through December 15. Beta-only spots do not guarantee workshops, monthly mentorship check-ins, resume review, or one-to-one mentorship.`,
  },
  {
    question: 'What Happens After I Apply?',
    answer:
      `Applications run August 24–31 and close August 31 at 11:59 PM ET. Decisions are planned for September 3. Kelly will select ${program.capacity} mentees, ${program.alternateCapacity} alternates, and up to ${program.betaCapacity} extended beta testers. Selected participants must complete asynchronous onboarding by September 14.`,
  },
  {
    question: 'Why Is the Founding Cohort Free?',
    answer:
      'This is a free founding pilot. Kelly provides structured mentorship, personalized feedback, and early product access; participants commit time, use the tools in real situations, and provide candid feedback through December 15. Positive feedback and public testimonials are never required.',
  },
  {
    question: 'Does Applying or Participating Guarantee an Opportunity?',
    answer:
      'No. The program provides education, feedback, strategy, tools, and accountability. It does not guarantee conference acceptance or funding, referrals, interviews, internships, offers, compensation, or employment outcomes.',
  },
  {
    question: 'Is This Connected to Bloomberg or Kelly’s Employers?',
    answer:
      'No. Recruiting Season Accelerator is independently operated by Kelly Chen and is not affiliated with, sponsored by, or endorsed by Bloomberg or any current or former employer.',
  },
];

function SectionHeading({ eyebrow, title, body, id }) {
  return (
    <header className="landing-section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {body ? <p>{body}</p> : null}
    </header>
  );
}

function ApplicationButton({ className = 'button', label }) {
  const state = applicationState();
  const action = applicationAction(state);
  const resolvedLabel = state === 'closed' ? action.label : label || action.label;
  return <a className={className} href={action.href}>{resolvedLabel}</a>;
}

function useLandingPageMotion() {
  useEffect(() => {
    const root = document.querySelector('.program-site');
    if (!root) return undefined;

    const sections = Array.from(
      root.querySelectorAll('main > section:not(.program-hero)'),
    );
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('landing-motion-ready');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return () => root.classList.remove('landing-motion-ready');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    const frameId = window.requestAnimationFrame(() => {
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight * 0.94) {
          section.classList.add('is-visible');
        }
        observer.observe(section);
      });
    });

    const safetyRevealId = window.setTimeout(() => {
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top < window.innerHeight * 1.2) {
          section.classList.add('is-visible');
        }
      });
    }, 1600);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(safetyRevealId);
      observer.disconnect();
      root.classList.remove('landing-motion-ready');
    };
  }, []);
}

export function LandingPage() {
  useLandingPageMotion();
  const state = applicationState();

  return (
    <div className="program-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className={`announcement ${state}`}>
        <span>Free Fall 2026 Founding Cohort · {program.capacity} Mentorship Spots</span>
        <strong>
          {state === 'opening-soon'
            ? 'Applications Open August 24, 2026'
            : state === 'open'
              ? 'Applications Are Open · Close August 31 at 11:59 PM ET'
              : 'Founding Cohort Applications Are Closed'}
        </strong>
      </div>
      <ProgramHeader />

      <main id="main-content">
        <section className="program-hero">
          <div className="landing-shell hero-layout">
            <div className="program-hero-copy">
              <p className="eyebrow">Free Fall 2026 Founding Cohort</p>
              <h1>
                <span className="hero-setup">Build a Smarter Fall</span>
                <em><span>Opportunity</span> Strategy.</em>
              </h1>
              <p className="hero-lede">
                Recruiting Season Accelerator is a free Fall 2026 founding mentorship
                cohort for college students pursuing early-career technology opportunities.
                It is designed primarily for freshmen and sophomores, but students from
                every college year may apply.
              </p>
              <p className="hero-receive-copy">
                Eight selected students will receive four live workshops and Q&amp;As, a
                one-hour resume review, a one-hour strategy session, early access to
                ApplyFirst, the conference playbook, and a personalized 60-day plan—then
                continue with lighter check-ins and resource access through December 15.
              </p>
              <div className="hero-actions">
                <ApplicationButton />
                <a className="text-link" href="#program">See What&apos;s Included</a>
              </div>
              <p className="hero-microcopy">
                Fall-semester cohort: September 14–December 15 · Ages 18+ · All college years · Free · Applications close August 31 at 11:59 PM ET
              </p>
            </div>

            <aside className="strategy-card" aria-label="Program strategy">
              <div className="strategy-card-heading">
                <span>Selected Mentees Receive</span>
                <small>Eight Mentorship Spots</small>
              </div>
              <ol>
                <li><span>04</span><div><strong>Live Workshops and Q&amp;As</strong><small>Tailored after the cohort is selected.</small></div></li>
                <li><span>01</span><div><strong>Resume Review</strong><small>Plus one bounded offline re-review.</small></div></li>
                <li><span>01</span><div><strong>Strategy Session</strong><small>Focused on your goals and bottleneck.</small></div></li>
                <li><span>Early</span><div><strong>Tools and Playbook</strong><small>ApplyFirst and conference guidance.</small></div></li>
              </ol>
              <div className="strategy-card-result">
                <span>Leave With</span>
                <strong>A Personalized 60-Day Opportunity Plan</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="snapshot" aria-labelledby="snapshot-title">
          <div className="landing-shell snapshot-layout">
            <div>
              <p className="eyebrow">Program at a Glance</p>
              <h2 id="snapshot-title">One Fall-Semester Cohort. Two Phases.</h2>
              <p>The cohort runs September 14–December 15: a four-week intensive followed by lighter monthly check-ins and continued ApplyFirst and conference-playbook testing.</p>
            </div>
            <dl className="snapshot-grid">
              <div><dt>Sep–Dec</dt><dd>Fall-Semester Cohort</dd><small>September 14 through December 15</small></div>
              <div><dt>4</dt><dd>High-Touch Weeks</dd><small>Workshops, two individual sessions, and a 60-day plan</small></div>
              <div><dt>3</dt><dd>Monthly Check-Ins</dd><small>October progress, November recruiting, and December closeout</small></div>
              <div><dt>Free</dt><dd>Founding Pilot</dd><small>Real participation and candid feedback required</small></div>
            </dl>
          </div>
        </section>

        <section className="landing-section" id="fit" aria-labelledby="fit-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="Who It’s For"
              title="Build Early-Career Momentum Intentionally."
              body="Open to current college students from every class year. The selected mentorship cohort will lean underclassman while making room for juniors and seniors whose goals fit the program."
              id="fit-title"
            />
            <div className="bottleneck-grid">
              {bottlenecks.map(([title, body], index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="fit-panel">
              <article>
                <p className="eyebrow">A Strong Fit</p>
                <h3>You Are Ready to Explore and Take Action.</h3>
                <ul>
                  <li>You are a current college student in any class year and will be at least 18 when the program begins.</li>
                  <li>You are pursuing software engineering or a closely related technology path.</li>
                  <li>You have a basic resume; previous internship experience is not required.</li>
                  <li>You are willing to act on feedback, test the resources, and provide candid product feedback through December 15.</li>
                </ul>
              </article>
              <article>
                <p className="eyebrow">Not the Right Format</p>
                <h3>This Is Not a Coding Course or Referral Service.</h3>
                <ul>
                  <li>No LeetCode curriculum or daily application management</li>
                  <li>No guaranteed referrals, interviews, internships, or offers</li>
                  <li>No immigration, legal, tax, or financial advice</li>
                  <li>No unlimited coaching or done-for-you application materials</li>
                </ul>
              </article>
            </div>
            <div className="fit-selection-note">
              <h3>How the Founding Cohort Will Be Balanced:</h3>
              <p>
                Kelly will target at least five freshmen or sophomores among the eight
                mentorship participants, with up to three juniors or seniors whose needs
                genuinely fit. Beta-only testers may come from any college year.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-section included-section" id="program" aria-labelledby="program-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="What’s Included"
              title="Start Intensively. Apply It All Semester."
              body="The cohort runs September 14–December 15. High-touch support is concentrated in the first four weeks, followed by a lighter cadence while you use the strategy in real recruiting situations."
              id="program-title"
            />
            <div className="included-grid">
              {included.map(([mark, title, body]) => (
                <article key={title}>
                  <span>{mark}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>

            <div className="journey">
              <div className="journey-heading">
                  <p className="eyebrow">Phase 1 · The Four-Week Intensive</p>
                  <h3>Four Weeks. One Connected Strategy.</h3>
                  <p className="journey-summary">
                  The detailed exercises and hot seats will adapt after Kelly reviews the
                  selected cohort, while the overall progression stays consistent.
                </p>
              </div>
              <ol>
                {journey.map(([week, title, body]) => (
                  <li key={week}>
                    <span>{week}</span>
                    <h4>{title}</h4>
                    <p>{body}</p>
                  </li>
                ))}
              </ol>
              <small>Workshop themes may adapt to participant goals, progress, and common cohort needs. Weekly workshops end October 11.</small>
            </div>

            <div className="semester-continuation" aria-labelledby="continuation-title">
              <div className="continuation-heading">
                <p className="eyebrow">Phase 2 · October 12–December 15</p>
                <h3 id="continuation-title">Use the Strategy Through the Fall Semester.</h3>
                <p>
                  The cadence becomes lighter so participants have time to use ApplyFirst,
                  the conference playbook, and their 60-day plans in real situations.
                </p>
              </div>
              <ol>
                {semesterMilestones.map(([month, title, body]) => (
                  <li key={month}>
                    <span>{month}</span>
                    <h4>{title}</h4>
                    <p>{body}</p>
                  </li>
                ))}
              </ol>
              <div className="continuation-cadence">
                <p><strong>Between Check-Ins</strong> Complete a short ApplyFirst feedback prompt approximately every two weeks. Conference feedback is requested around each participant&apos;s actual event dates when relevant.</p>
                <p><strong>After the Intensive</strong> Weekly workshops and guaranteed individual sessions end October 11. Continued support does not include unlimited Slack or DM access, extra one-to-one sessions, or repeated resume-review cycles.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section outcome-section" aria-labelledby="outcomes-title">
          <div className="landing-shell outcome-layout">
            <SectionHeading
              eyebrow="Leave With Direction"
              title="Leave Knowing What to Do Next."
              id="outcomes-title"
            />
            <aside className="sample-output" aria-label="Illustrative recruiting plan">
              <p className="eyebrow">Sample Output</p>
              <h3>A 60-Day Opportunity Sprint</h3>
              <ol>
                <li><span>Weeks 1–2</span><strong>Act on Priority Opportunities</strong></li>
                <li><span>Weeks 3–4</span><strong>Build Evidence and Relationships</strong></li>
                <li><span>Weeks 5–8</span><strong>Review Progress and Adjust</strong></li>
              </ol>
              <small>Illustrative format; each participant&apos;s plan is personalized.</small>
            </aside>
            <ul className="outcome-list">
              {outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
            </ul>
            <p className="outcome-disclaimer">
              Educational resources, strategy, feedback, and accountability are provided.
              Participation does not guarantee any employment outcome.
            </p>
          </div>
        </section>

        <section className="landing-section founder-section" aria-labelledby="founder-title">
          <div className="landing-shell founder-layout">
            <div className="founder-portrait">
              <img src="/profile.jpg" alt="Kelly Chen" loading="lazy" />
            </div>
            <div>
              <p className="eyebrow">Your Mentor</p>
              <h2 id="founder-title">Meet Kelly, Your Mentor.</h2>
              <p>
                Kelly Chen is a software engineer, product builder, speaker, and community
                leader whose experience spans Visa, JPMorgan Chase, Bloomberg, early-career
                programs, conferences, hackathons, and student mentorship. She found and
                pursued opportunities early in college and ultimately found her full-time role
                through a conference. That range helps her tailor advice to a student&apos;s real
                context—not offer employer access.
              </p>
              <div className="experience-row" aria-label="Experience informing the program">
                <strong>Visa</strong><strong>JPMorgan Chase</strong><strong>Bloomberg</strong>
              </div>
              <div className="profile-links" aria-label="Kelly Chen profiles">
                <a href={program.portfolioUrl}>View Kelly&apos;s Portfolio</a>
                <a href="https://www.linkedin.com/in/kellychen0921/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              </div>
              <small>
                Recruiting Season Accelerator is independently operated by Kelly Chen.
                These employers do not sponsor or endorse it. Participation does not provide
                preferred access, referrals, interviews, or employment consideration.
              </small>
            </div>
          </div>
        </section>

        <section className="landing-section pricing-section" aria-labelledby="pricing-title">
          <div className="landing-shell pricing-layout">
            <SectionHeading
              eyebrow="Two Ways to Participate"
              title="Choose the Right Participation Track."
              body="All current college years may apply. One application is used to select eight high-touch mentorship participants and up to seven beta-only testers."
              id="pricing-title"
            />
            <div className="price-card">
              <span>Fall 2026 Founding Pilot</span>
              <strong>Free</strong>
              <p>No payment or positive testimonial is required. The two tracks have different levels of support.</p>
              <section className="track-option mentorship-track">
                <div><span>Founding Mentorship Cohort</span><strong>{program.capacity} Students</strong></div>
                <ul>
                  <li>Four live group workshops and Q&amp;As</li>
                  <li>One-hour resume review and one offline re-review</li>
                  <li>One-hour individual strategy session</li>
                  <li>ApplyFirst and conference playbook access</li>
                  <li>Personalized 60-day plan</li>
                  <li>October, November, and December group check-ins</li>
                  <li>Short ApplyFirst feedback approximately every two weeks</li>
                  <li>Conference feedback around actual event dates when relevant</li>
                  <li>Continued cohort-resource access through December 15</li>
                </ul>
              </section>
              <section className="track-option beta-track">
                <div><span>Extended Beta-Only Group</span><strong>Up to {program.betaCapacity} Students</strong></div>
                <ul>
                  <li>Early ApplyFirst access</li>
                  <li>Conference playbook access when relevant</li>
                  <li>Short ApplyFirst feedback prompts through December 15</li>
                  <li>No guaranteed workshops, monthly mentorship check-ins, resume review, or one-to-one mentorship</li>
                </ul>
              </section>
              <ApplicationButton label="Review the Application" />
            </div>
          </div>
        </section>

        <section className="landing-section timeline-section" id="timeline" aria-labelledby="timeline-title">
          <div className="landing-shell">
            <SectionHeading eyebrow="Important Dates" title="Key Dates for the Founding Cohort." id="timeline-title" />
            <ol className="date-timeline">
              <li><span>01</span><div><strong>Applications</strong><time>{program.applicationDates}</time></div></li>
              <li><span>02</span><div><strong>Decisions</strong><time>{program.decisionDates}</time><small>Onboarding due {program.onboardingDueDate}</small></div></li>
              <li><span>03</span><div><strong>High-Touch Intensive</strong><time>{program.intensiveDates}</time></div></li>
              <li><span>04</span><div><strong>Lighter Cohort Phase</strong><time>{program.continuationDates}</time></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="landing-shell faq-layout">
            <SectionHeading eyebrow="Questions" title="Before You Apply." id="faq-title" />
            <div className="faq-list">
              {faqs.slice(0, 5).map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
              <a className="text-link" href="/faq">View All Program Questions</a>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="landing-shell">
            <p className="eyebrow">Prepare Your Application</p>
            <h2>Ready to Build Your Fall Opportunity Strategy?</h2>
            <p>Bring a basic resume, one concrete action you have taken recently, and the question you most want Kelly&apos;s help solving.</p>
            <ApplicationButton />
          </div>
        </section>
      </main>

      <ProgramFooter />
    </div>
  );
}

const policyContent = {
  terms: {
    eyebrow: 'Program Policy',
    title: 'Participant Terms',
    updated: 'Draft for the 2026 Founding Cohort',
    sections: [
      ['Program and Operator', `Recruiting Season Accelerator is a Fall 2026 educational, mentorship, and product-research pilot operated by Kelly Chen. Questions may be sent to ${program.contactEmail}.`],
      ['Eligibility', 'Current college students from every class year may apply and must be at least 18 when the program begins. The mentorship cohort will lean toward freshmen and sophomores, while beta-only testers may come from any college year. A basic resume is required for mentorship applicants.'],
      ['Enrollment and Cost', 'The Fall 2026 founding mentorship cohort and extended beta are free. Applying does not guarantee acceptance, and participation requires completing the applicable onboarding and participation expectations.'],
      ['Included Mentorship Support', 'The fall-semester cohort runs September 14–December 15. The September 14–October 11 intensive includes four 75-minute group workshops, one 60-minute resume-review session, one 60-minute strategy session, one bounded offline resume re-review, early ApplyFirst and conference-playbook access, and a personalized 60-day plan. From October 12–December 15, founding mentees receive one monthly group check-in, continued cohort-resource access, short ApplyFirst feedback prompts approximately every two weeks, and conference feedback requests around actual event dates when relevant.'],
      ['Support Boundaries', 'Weekly workshops and guaranteed individual sessions end October 11. The lighter cohort phase does not include guaranteed additional one-to-one sessions, unlimited Slack or direct-message support, unlimited coaching, or repeated resume-review cycles. Workshop examples and exercises may adapt to cohort needs without materially reducing the promised intensive support.'],
      ['Extended Beta Support', 'Extended beta participants receive early ApplyFirst and conference-playbook access, onboarding guidance, and product-feedback prompts through December 15. They do not receive guaranteed resume reviews, individual mentorship, monthly mentorship check-ins, weekly workshops, referrals, or unlimited support.'],
      ['Feedback and Conduct', 'Participants agree to use the applicable pilot resources, provide candid feedback through December 15, respect other participants, and protect information shared in the group. Feedback may be positive, neutral, or critical; a testimonial is not required.'],
      ['Participant Responsibility', 'Participants remain responsible for their applications, materials, decisions, attendance, and recruiting outcomes. Materials must be accurate and must not misrepresent experience.'],
      ['No Outcome Guarantee', 'Participation does not guarantee conference acceptance or funding, a referral, interview, internship, job offer, compensation level, or other employment outcome.'],
      ['Independent Program', 'The program is not affiliated with, sponsored by, or endorsed by Bloomberg or any current or former employer. All guidance is Kelly’s own.'],
    ],
  },
  privacy: {
    eyebrow: 'Program Policy',
    title: 'Privacy Notice',
    updated: 'Draft for the 2026 Founding Cohort',
    sections: [
      ['Information Collected', 'The application may collect contact information, school and graduation details, resume and profile links, early-career goals, recent actions, conference readiness, participation information, and optional feedback or outcome updates. Accepted participants may be asked for additional scheduling, onboarding, product-usage, and program-preference information.'],
      ['How Information Is Used', 'Information is used to evaluate applications, select and onboard mentorship and beta participants, deliver the program, improve ApplyFirst and the conference playbook, track aggregate pilot learning, plan future cohorts, and send requested cohort announcements.'],
      ['Storage and Service Providers', 'Cloudflare processes application and future-cohort interest records, along with private resume files, for this portal. Other program vendors may process scheduling, video, communication, research, or file information according to their own terms.'],
      ['Your Choices', `Information is not sold. Public use of a name, image, quote, school, employer, or outcome requires separate permission. Correction or deletion requests may be sent to ${program.contactEmail}.`],
      ['Retention', 'Rejected application data should generally be deleted within 60–90 days unless the applicant separately joins an updates list. Accepted-participant working files are minimized and removed or anonymized when no longer needed.'],
    ],
  },
  refund: {
    eyebrow: 'Program Policy',
    title: 'Cost and Participation Policy',
    updated: 'Draft for the 2026 Founding Cohort',
    sections: [
      ['Founding-Pilot Cost', 'The Fall 2026 founding mentorship cohort and extended beta are free. No payment or payment information is required to apply or participate.'],
      ['The Exchange', 'Kelly provides early access, structured mentorship, and personalized feedback according to each participation level. Participants commit time, use the resources in real situations, and provide candid feedback through December 15.'],
      ['No Positive-Feedback Requirement', 'Feedback may be positive, neutral, or critical. Participation never requires a public testimonial, endorsement, or permission to use a participant’s identity.'],
      ['Missed Participation', 'Repeatedly missing required sessions, onboarding, weekly actions, or feedback may result in removal from the pilot so limited capacity can be used responsibly.'],
      ['Program Changes', 'ApplyFirst, the conference playbook, workshop examples, and research prompts may change during the founding period. Kelly will communicate material changes and will not use the pilot to promise referrals, funding, interviews, or employment outcomes.'],
    ],
  },
};

export function PolicyPage({ type }) {
  const content = policyContent[type];
  return (
    <div className="program-site">
      <ProgramHeader compact />
      <main className="policy-main">
        <div className="policy-shell">
          <a className="text-link" href="/">← Back to Program Details</a>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="policy-updated">{content.updated}</p>
          <div className="policy-sections">
            {content.sections.map(([title, body]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </section>
            ))}
          </div>
          <p className="policy-review-note">
            This plain-language operational draft should receive professional review before the program materially scales.
          </p>
        </div>
      </main>
      <ProgramFooter />
    </div>
  );
}

export function FaqPage() {
  return (
    <div className="program-site">
      <ProgramHeader compact />
      <main className="policy-main">
        <div className="policy-shell faq-page-shell">
          <a className="text-link" href="/">← Back to Program Details</a>
          <p className="eyebrow">Program Questions</p>
          <h1>Frequently Asked Questions</h1>
          <p className="policy-updated">Clear answers before you apply.</p>
          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <p className="policy-review-note">
            Still deciding? Email <a href={`mailto:${program.contactEmail}`}>{program.contactEmail}</a>.
          </p>
        </div>
      </main>
      <ProgramFooter />
    </div>
  );
}

