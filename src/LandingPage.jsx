import React, { useEffect } from 'react';
import { applicationAction, applicationState, program } from './program.js';
import { ProgramFooter, ProgramHeader } from './siteChrome.jsx';

const bottlenecks = [
  ['01', 'Opportunity Discovery', 'You need better places to find high-fit opportunities.'],
  ['02', 'Prioritization', 'You are active, but unsure what deserves your time.'],
  ['03', 'Positioning', 'Your experience is stronger than your current story.'],
  ['04', 'Follow-Through', 'You need a system for applying, learning, and adjusting.'],
];

const workshopThemes = [
  ['Week 1 · Sep 14–20', 'Opportunity Strategy'],
  ['Week 2 · Sep 21–27', 'Early-Career Positioning'],
  ['Week 3 · Sep 28–Oct 4', 'Conferences and Networking'],
  ['Week 4 · Oct 5–11', 'Recruiting Execution'],
];

export const faqs = [
  {
    question: 'What Is Recruiting Season Accelerator?',
    answer:
      'It is a free Fall 2026 mentorship cohort for college students pursuing early-career technology opportunities. A four-week intensive is followed by lighter check-ins and resource testing through December 15.',
  },
  {
    question: 'Who Can Apply?',
    answer:
      'Current college students from every class year may apply if they will be at least 18 by September 14. The program primarily supports software engineering and related technology paths; prior internship or conference experience is not required.',
  },
  {
    question: 'What Do Selected Mentees Receive?',
    answer:
      'Eight mentees receive four 75-minute live workshops and Q&As, a one-hour resume review, one offline resume re-review, a one-hour strategy session, early ApplyFirst and conference-playbook access, and a personalized 60-day plan. Monthly check-ins, continued resource access, and lightweight feedback continue through December 15.',
  },
  {
    question: 'What Is the Time Commitment?',
    answer:
      'From September 14–October 11, plan for approximately one to two hours per week plus two scheduled one-hour individual sessions, and attend at least three of four virtual workshops. From October 12–December 15, plan for one monthly group check-in and a short ApplyFirst feedback prompt about every two weeks; final live times will reflect accepted participants’ availability.',
  },
  {
    question: 'Do I Need to Be Attending a Conference?',
    answer:
      'No. Conference attendance is not required, but interest in attending—or an existing acceptance—is helpful context for tailoring your strategy. The mentorship application does not register you for conference materials; access outside the cohort uses a separate form.',
  },
  {
    question: 'What Do I Need to Apply?',
    answer:
      'You need a basic resume, a LinkedIn profile, one concrete action you have taken recently, and a specific recruiting question or bottleneck. Applicants should also be willing to act on direct feedback, participate consistently, and test the included resources.',
  },
  {
    question: 'What Happens After I Apply?',
    answer:
      `Applications are accepted August 24–31 and close August 31 at 11:59 PM ET. Decisions are planned for September 3; Kelly will select ${program.capacity} mentees and ${program.alternateCapacity} alternates, and selected participants must complete asynchronous onboarding by September 14.`,
  },
  {
    question: 'Why Is the Founding Cohort Free?',
    answer:
      'This is a founding pilot. There is no fee, scholarship process, or required positive testimonial; participants contribute consistent participation and candid feedback on ApplyFirst, the conference playbook, and the mentorship experience.',
  },
  {
    question: 'What Is Not Included?',
    answer:
      'This is not a coding course, technical-interview tutoring service, or referral program. It does not include unlimited Slack or direct-message support, additional guaranteed one-to-one sessions, or repeated resume-review cycles after the intensive, and it does not guarantee conference funding, interviews, internships, offers, or employment.',
  },
  {
    question: 'Is This Connected to Bloomberg or Kelly’s Employers?',
    answer:
      'No. Recruiting Season Accelerator is independently operated by Kelly Chen and is not affiliated with, sponsored by, or endorsed by Bloomberg or any current or former employer.',
  },
];

const homepageFaqQuestions = new Set([
  'Do I Need to Be Attending a Conference?',
  'What Do I Need to Apply?',
  'What Happens After I Apply?',
  'Why Is the Founding Cohort Free?',
  'What Is Not Included?',
]);

function SectionHeading({ eyebrow, title, body, id, index }) {
  return (
    <header className="landing-section-heading">
      <div className="section-kicker">
        {index ? <span className="section-index" aria-hidden="true">{index}</span> : null}
        <p className="eyebrow">{eyebrow}</p>
        <span className="section-kicker-rule" aria-hidden="true" />
      </div>
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
                A Fall 2026 mentorship cohort for college students pursuing
                early-career technology opportunities. Bring the recruiting work you
                have already started; Kelly will help you identify what to improve,
                prioritize, and do next.
              </p>
              <ul className="hero-benefit-list" aria-label="Program highlights">
                <li>Four Live Workshops</li>
                <li>Resume Review and Re-Review</li>
                <li>One-to-One Strategy Session</li>
                <li>ApplyFirst and Conference Playbook</li>
                <li>Personalized 60-Day Plan</li>
              </ul>
              <div className="hero-actions">
                <ApplicationButton />
                <a className="text-link" href="#program">See What&apos;s Included</a>
              </div>
              <p className="hero-microcopy">
                Applications close August 31 at 11:59 PM ET · Cohort runs September 14–December 15
              </p>
            </div>

            <aside className="strategy-card" aria-label="Program strategy">
              <div className="strategy-card-heading">
                <span>Kelly&apos;s Approach</span>
                <small>Diagnosis Before Advice</small>
              </div>
              <ol>
                <li><span>01</span><div><strong>Diagnose</strong><small>Identify the bottleneck before adding more activity.</small></div></li>
                <li><span>02</span><div><strong>Position</strong><small>Clarify the story your experience communicates.</small></div></li>
                <li><span>03</span><div><strong>Prioritize</strong><small>Focus on the opportunities and actions that fit.</small></div></li>
                <li><span>04</span><div><strong>Adjust</strong><small>Use real recruiting signals to refine the plan.</small></div></li>
              </ol>
              <div className="strategy-card-result">
                <span>Working Principle</span>
                <strong>Start With the Student, Not a Generic Checklist</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="landing-section" id="fit" aria-labelledby="fit-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="Who It’s For"
              title="For Students Who Have Started—but Need Better Results."
              body="No prior internship is required. The strongest applicants can name where they feel stuck and are ready to test a more focused approach."
              id="fit-title"
              index="01"
            />
            <div className="bottleneck-grid" aria-label="Common recruiting bottlenecks">
              {bottlenecks.map(([number, title, body]) => (
                <article key={title}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="fit-panel">
              <article>
                <p className="eyebrow">Eligibility</p>
                <h3>You Can Apply If:</h3>
                <ul>
                  <li>Current college student from any class year, age 18+ by September 14</li>
                  <li>Pursuing software engineering or a related technology path</li>
                  <li>Basic resume ready for review</li>
                </ul>
              </article>
              <article>
                <p className="eyebrow">Strong Fit</p>
                <h3>You Are Ready To:</h3>
                <ul>
                  <li>Share a concrete action from the past 30 days</li>
                  <li>Name a specific recruiting bottleneck or decision</li>
                  <li>Act on direct, individualized feedback</li>
                  <li>Meet the commitment and test the resources consistently</li>
                </ul>
              </article>
            </div>
            <p className="fit-preference-note"><strong>Conference Interest Is a Plus, Not a Requirement.</strong> The mentorship application asks about your current plans so Kelly can understand your goals and tailor the cohort—not to register you for conference materials.</p>
            <p className="scope-note"><strong>Program Focus:</strong> Opportunity strategy, positioning, and recruiting execution—not technical-interview tutoring, referrals, or unlimited private coaching.</p>
          </div>
        </section>

        <section className="landing-section included-section" id="program" aria-labelledby="program-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="What’s Included"
              title="One Cohort. Two Phases."
              body="Build the strategy during a four-week intensive, then apply and adjust it through December 15."
              id="program-title"
              index="02"
            />
            <div className="phase-board">
              <article className="phase-column phase-intensive" data-phase="01">
                <header className="phase-header">
                  <span>Phase 1</span>
                  <time>September 14–October 11</time>
                  <h3>Build the Strategy</h3>
                </header>
                <ul className="phase-list">
                  <li>Four 75-Minute Live Workshops and Q&amp;As</li>
                  <li>One-Hour Resume Review</li>
                  <li>One Offline Resume Re-Review</li>
                  <li>One-Hour Strategy Session</li>
                  <li>Personalized 60-Day Plan</li>
                </ul>
                <p className="phase-commitment">
                  <strong>Commitment</strong>
                  About one to two hours per week, plus two one-hour individual sessions. Attend at least three of four virtual workshops; times will reflect cohort availability.
                </p>
              </article>

              <article className="phase-column phase-apply" data-phase="02">
                <header className="phase-header">
                  <span>Phase 2</span>
                  <time>October 12–December 15</time>
                  <h3>Apply and Adjust</h3>
                </header>
                <ul className="phase-list">
                  <li>Progress and ApplyFirst Check-In</li>
                  <li>Recruiting and Conference Check-In</li>
                  <li>Semester Closeout and Next Steps</li>
                </ul>
                <p className="phase-commitment">
                  <strong>Cadence</strong>
                  One monthly group check-in and a short feedback prompt about every two weeks, with conference feedback timed around relevant event dates.
                </p>
              </article>
            </div>

            <div className="workshop-focus" aria-label="Four-week workshop focus">
              <div className="workshop-focus-heading">
                <span>Four-Week Focus</span>
                <strong>One Connected Strategy</strong>
              </div>
              <ol>
                {workshopThemes.map(([week, title]) => (
                  <li key={week}>
                    <span>{week}</span>
                    <strong>{title}</strong>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="landing-section founder-section" aria-labelledby="founder-title">
          <div className="landing-shell founder-layout">
            <div className="founder-portrait">
              <img src="/profile.jpg" alt="Kelly Chen" loading="lazy" />
            </div>
            <div>
              <div className="section-kicker founder-kicker">
                <span className="section-index" aria-hidden="true">03</span>
                <p className="eyebrow">Your Mentor</p>
                <span className="section-kicker-rule" aria-hidden="true" />
              </div>
              <h2 id="founder-title">Meet Kelly, Your Mentor.</h2>
              <p>
                Kelly Chen is a software engineer, product builder, speaker, and community
                leader. Her path spans early-college programs, internships, conferences,
                hackathons, technical work, and student mentorship—including finding her
                full-time role through a conference. That range helps her tailor advice to each
                student&apos;s mix of experience, positioning, timing, and follow-through instead
                of assuming every student needs the same next step.
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

        <section className="landing-section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="landing-shell faq-layout">
            <SectionHeading eyebrow="Questions" title="Before You Apply." id="faq-title" index="04" />
            <div className="faq-list">
              {faqs.filter((item) => homepageFaqQuestions.has(item.question)).map((item) => (
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
            <p className="eyebrow">Next Step</p>
            <h2>Review the Application When You&apos;re Ready.</h2>
            <p>The form takes about 7–10 minutes. Review the questions and prepare your resume before you begin.</p>
            <ApplicationButton label="Review the Application" />
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
      ['Eligibility', 'Current college students from every class year may apply and must be at least 18 when the program begins. A basic resume is required. Conference attendance is not required.'],
      ['Enrollment and Cost', 'The Fall 2026 founding mentorship cohort is free. Applying does not guarantee acceptance, and participation requires completing the onboarding and participation expectations.'],
      ['Included Mentorship Support', 'The fall-semester cohort runs September 14–December 15. The September 14–October 11 intensive includes four 75-minute group workshops, one 60-minute resume-review session, one 60-minute strategy session, one bounded offline resume re-review, early ApplyFirst and conference-playbook access, and a personalized 60-day plan. From October 12–December 15, founding mentees receive one monthly group check-in, continued cohort-resource access, short ApplyFirst feedback prompts approximately every two weeks, and conference feedback requests around actual event dates when relevant.'],
      ['Support Boundaries', 'Weekly workshops and guaranteed individual sessions end October 11. The lighter cohort phase does not include guaranteed additional one-to-one sessions, unlimited Slack or direct-message support, unlimited coaching, or repeated resume-review cycles. Workshop examples and exercises may adapt to cohort needs without materially reducing the promised intensive support.'],
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
      ['How Information Is Used', 'Information is used to evaluate applications, select and onboard mentorship participants, deliver the program, improve ApplyFirst and the conference playbook, track aggregate pilot learning, plan future cohorts, and send requested cohort announcements. ApplyFirst beta and conference-material sign-ups outside the mentorship cohort are collected separately.'],
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
      ['Founding-Pilot Cost', 'The Fall 2026 founding mentorship cohort is free. No payment or payment information is required to apply or participate.'],
      ['The Exchange', 'Kelly provides early access, structured mentorship, and personalized feedback within the stated program scope. Participants commit time, use the resources in real situations, and provide candid feedback through December 15.'],
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

