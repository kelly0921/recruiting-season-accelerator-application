import React, { useEffect } from 'react';
import { applicationAction, applicationState, program } from './program.js';
import { ProgramFooter, ProgramHeader } from './siteChrome.jsx';

const bottlenecks = [
  ['Positioning', 'Your experience is stronger than the story your resume currently tells.'],
  ['Targeting', 'You are applying, but your role and company strategy is too broad—or too narrow.'],
  ['Conversion', 'You are getting some traction but do not know where the process is breaking down.'],
  ['Prioritization', 'You have options and advice, but no clear sequence for what to improve first.'],
];

const included = [
  ['4', 'Weekly Workshops', 'Four live, 60-minute Zoom sessions built around focused exercises—not passive lectures.'],
  ['3', 'Private Sessions', 'An initial diagnosis, midpoint course correction, and final continuation strategy.'],
  ['1', 'Written Resume Review', 'Specific feedback on positioning, clarity, and the story your experience communicates.'],
  ['1', 'Career Asset Review', 'Feedback on one additional asset—such as your portfolio, LinkedIn profile, outreach, or recruiting strategy—selected around your bottleneck.'],
  ['4', 'Weeks of Support', 'Private Slack, weekly accountability, and ApplyFirst tools used throughout the program.'],
  ['1', 'Future Offer Strategy Session', 'One 30-minute strategy session for your next internship or new-grad offer, included for every founding participant.'],
];

const journey = [
  ['Week 1', 'Diagnose', 'Audit what you have already tried, compare effort with results, and identify the highest-leverage gap.'],
  ['Week 2', 'Position', 'Turn your real experience into a sharper resume, career story, and value proposition.'],
  ['Week 3', 'Test and Adjust', 'Use response patterns—not a generic checklist—to refine targeting, applications, and networking.'],
  ['Week 4', 'Continue', 'Keep what works and leave with a personalized 60- or 90-day plan for what comes next.'],
];

const outcomes = [
  'A Personalized Recruiting Diagnosis',
  'A Clearer Target Role and Company Strategy',
  'An Improved Resume',
  'A Prioritized Recruiting System',
  'Personalized Feedback on an Additional Career Asset',
  'A Written 60- or 90-Day Action Plan',
];

export const faqs = [
  {
    question: 'Who Is the Program Designed For?',
    answer:
      'Primarily sophomores, juniors, and seniors pursuing software engineering internships or new-grad roles. Selective freshmen who are at least 18 and already have meaningful technical or recruiting experience may also apply.',
  },
  {
    question: 'Is This a Coding or Technical Interview Course?',
    answer:
      'No. The program focuses on recruiting strategy, positioning, target selection, organization, storytelling, networking, behavioral preparation, and diagnosing low response or conversion patterns.',
  },
  {
    question: 'What Is the Weekly Time Commitment and Workshop Schedule?',
    answer:
      'The program includes one live, 60-minute Zoom workshop each week, three 30-minute private sessions across the four weeks, and approximately one to two hours of focused work between workshops. The exact workshop day and time will be finalized with the accepted cohort before payment and onboarding. Applicants should not assume recordings will be available; private sessions are scheduled individually.',
  },
  {
    question: 'What Happens After I Apply?',
    answer:
      `Applications close August 2 at 11:59 PM ET. Decisions are planned for ${program.decisionDates}. Accepted applicants receive private payment and onboarding instructions.`,
  },
  {
    question: 'Does Applying or Participating Guarantee an Interview or Offer?',
    answer:
      'No. The program provides education, feedback, strategy, and accountability. It does not guarantee referrals, interviews, internships, offers, compensation, or employment outcomes.',
  },
  {
    question: 'How Does the $20 Feedback Credit Work?',
    answer:
      'Participants who complete the published participation and feedback requirements within 14 days after the final workshop may receive a $20 partial refund. Feedback may be positive, neutral, or critical.',
  },
  {
    question: 'Are Scholarships Available for the Founding Cohort?',
    answer:
      'No scholarship seats are available for this first cohort. Accepted applicants receive private payment instructions, and no payment is collected with the application.',
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
  const action = applicationAction(applicationState());
  return <a className={className} href={action.href}>{label || action.label}</a>;
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
  const effectivePrice = program.price - program.feedbackCredit;

  return (
    <div className="program-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className={`announcement ${state}`}>
        <span>Founding Cohort · {program.capacity} Students Maximum</span>
        <strong>
          {state === 'opening-soon'
            ? 'Applications Open July 22, 2026'
            : state === 'open'
              ? 'Applications Close August 2, 2026 at 11:59 PM ET'
              : 'Founding Cohort Applications Are Closed'}
        </strong>
      </div>
      <ProgramHeader />

      <main id="main-content">
        <section className="program-hero">
          <div className="landing-shell hero-layout">
            <div className="program-hero-copy">
              <p className="eyebrow">A Focused Four-Week Recruiting Reset</p>
              <h1>
                <span className="hero-setup">Recruiting Season Is Here!</span>
                <em><span>Apply</span> With a Strategy.</em>
              </h1>
              <p className="hero-lede">
                Personalized mentorship for college students pursuing software engineering
                internships and new-grad roles who are already putting in the work—but are
                not seeing the response, interviews, or progress their experience should support.
              </p>
              <div className="hero-actions">
                <ApplicationButton />
                <a className="text-link" href="#program">See What&apos;s Included</a>
              </div>
              <p className="hero-microcopy">
                Application-based · $99 upfront ($79 after optional feedback credit) · No payment when applying
              </p>
            </div>

            <aside className="strategy-card" aria-label="Program strategy">
              <div className="strategy-card-heading">
                <span>Four-Week Strategy Brief</span>
                <small>Founding Cohort</small>
              </div>
              <ol>
                <li><span>01</span><div><strong>Diagnose</strong><small>Find the real recruiting bottleneck.</small></div></li>
                <li><span>02</span><div><strong>Position</strong><small>Strengthen your resume and story.</small></div></li>
                <li><span>03</span><div><strong>Apply</strong><small>Build a focused opportunity system.</small></div></li>
                <li><span>04</span><div><strong>Adjust</strong><small>Use results to decide what comes next.</small></div></li>
              </ol>
              <div className="strategy-card-result">
                <span>Leave With</span>
                <strong>A Personalized 60- or 90-Day Plan</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="snapshot" aria-labelledby="snapshot-title">
          <div className="landing-shell snapshot-layout">
            <div>
              <p className="eyebrow">Program at a Glance</p>
              <h2 id="snapshot-title">Small Cohort. Focused Support.</h2>
              <p>A deliberately limited cohort creates room for useful context, direct feedback, and individual strategy.</p>
            </div>
            <dl className="snapshot-grid">
              <div><dt>4</dt><dd>Weekly Workshops</dd><small>Live, focused, practical</small></div>
              <div><dt>3</dt><dd>Private Sessions</dd><small>Personalized to your bottleneck</small></div>
              <div><dt>6</dt><dd>Students Maximum</dd><small>A deliberately small cohort</small></div>
              <div><dt>${program.price}</dt><dd>Upfront Cost</dd><small>${effectivePrice} after the optional $20 feedback credit</small></div>
            </dl>
          </div>
        </section>

        <section className="landing-section" id="fit" aria-labelledby="fit-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="Start With the Bottleneck"
              title="Find the Bottleneck That Matters Most."
              body="Built for students whose materials and effort look solid on paper, but whose results point to a harder-to-see positioning, targeting, or conversion gap."
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
                <h3>You Are Ready to Use Specific Feedback.</h3>
                <ul>
                  <li>You are pursuing a SWE internship or new-grad role.</li>
                  <li>You have a project, coursework, research, program, leadership experience, or prior recruiting attempt.</li>
                  <li>You can complete focused work between sessions.</li>
                  <li>You want clearer priorities—not unlimited access or a shortcut.</li>
                </ul>
              </article>
              <article>
                <p className="eyebrow">Not the Right Format</p>
                <h3>This Is Not a Beginner Coding Course or Referral Service.</h3>
                <ul>
                  <li>No LeetCode curriculum or daily application management</li>
                  <li>No guaranteed referrals, interviews, internships, or offers</li>
                  <li>No immigration, legal, tax, or financial advice</li>
                  <li>No unlimited coaching or done-for-you application materials</li>
                </ul>
              </article>
            </div>
            <div className="fit-selection-note">
              <h3>What Kelly Looks For:</h3>
              <p>
                Students who have already started recruiting, can act on direct feedback,
                and have a specific bottleneck the program can realistically help address.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-section included-section" id="program" aria-labelledby="program-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="What’s Included"
              title="Everything Works Together."
              body="Each part supports the same progression: diagnose, position, apply, adjust, and decide."
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
                <p className="eyebrow">The Four-Week Journey</p>
                <h3>Four Weeks. One Strategy That Adapts.</h3>
                <p className="journey-summary">
                  This is not a generic weekly checklist. Each step uses your materials,
                  decisions, and recruiting response patterns to determine what to change next.
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
              <small>Workshop themes may adapt to participant goals, progress, and common cohort needs.</small>
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
              <h3>A 60-Day Recruiting Plan</h3>
              <ol>
                <li><span>Weeks 1–2</span><strong>Rewrite Positioning</strong></li>
                <li><span>Weeks 3–4</span><strong>Run a Focused Target-Company Sprint</strong></li>
                <li><span>Weeks 5–8</span><strong>Review Response Patterns and Adjust</strong></li>
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
                programs, and student mentorship. That range helps her spot gaps generic
                checklists miss and tailor advice to each student&apos;s actual materials,
                goals, and response patterns—not offer employer access.
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
              eyebrow="Founding Cohort"
              title="Four Weeks of Personalized Support."
              id="pricing-title"
            />
            <div className="price-card">
              <span>Founding Price</span>
              <strong>${program.price}</strong>
              <p>Paid privately after acceptance. There is no public checkout.</p>
              <div><span>Optional Feedback Credit</span><strong>−${program.feedbackCredit}</strong></div>
              <div><span>Effective Cost After Credit</span><strong>${effectivePrice}</strong></div>
              <ApplicationButton label="Review the Application" />
            </div>
          </div>
        </section>

        <section className="landing-section timeline-section" id="timeline" aria-labelledby="timeline-title">
          <div className="landing-shell">
            <SectionHeading eyebrow="Important Dates" title="Key Dates for the Founding Cohort." id="timeline-title" />
            <ol className="date-timeline">
              <li><span>01</span><div><strong>Applications</strong><time>{program.applicationDates}</time></div></li>
              <li><span>02</span><div><strong>Decisions</strong><time>{program.decisionDates}</time></div></li>
              <li><span>03</span><div><strong>Program Begins</strong><time>{program.startDate}</time></div></li>
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
            <h2>Ready to Build a Clearer Recruiting Plan?</h2>
            <p>Have your resume, LinkedIn profile, graduation date, and current recruiting goals ready.</p>
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
      ['Program and Operator', `Recruiting Season Accelerator is a four-week educational and mentorship program operated by Kelly Chen. Questions may be sent to ${program.contactEmail}.`],
      ['Enrollment and Price', `The founding-cohort price is $${program.price}. Applying does not guarantee acceptance, and a seat is confirmed only after acceptance and private payment.`],
      ['Included Support', 'The program includes four workshops, three private sessions, a written resume review, one additional personalized review, Slack support, ApplyFirst resources, a continuation plan, and one future offer-strategy session. Themes may adapt without materially reducing the promised support.'],
      ['Participant Responsibility', 'Participants remain responsible for their applications, materials, decisions, attendance, and recruiting outcomes. Materials must be accurate and must not misrepresent experience.'],
      ['No Employment Guarantee', 'Participation does not guarantee a referral, interview, internship, job offer, compensation level, or other employment outcome.'],
      ['Independent Program', 'The program is not affiliated with, sponsored by, or endorsed by Bloomberg or any current or former employer. All guidance is Kelly’s own.'],
    ],
  },
  privacy: {
    eyebrow: 'Program Policy',
    title: 'Privacy Notice',
    updated: 'Draft for the 2026 Founding Cohort',
    sections: [
      ['Information Collected', 'The application may collect contact information, school and graduation details, resume and profile links, recruiting goals and history, participation information, and optional feedback or outcome updates.'],
      ['How Information Is Used', 'Information is used to evaluate applications, select and onboard participants, deliver mentorship, operate workshops and support, improve resources, and track aggregate program outcomes.'],
      ['Storage and Service Providers', 'Cloudflare processes application records and private resume files for this portal. Other program vendors may process payment, scheduling, video, communication, or file information according to their own terms.'],
      ['Your Choices', `Information is not sold. Public use of a name, image, quote, school, employer, or outcome requires separate permission. Correction or deletion requests may be sent to ${program.contactEmail}.`],
      ['Retention', 'Rejected application data should generally be deleted within 60–90 days unless the applicant separately joins an updates list. Accepted-participant working files are minimized and removed or anonymized when no longer needed.'],
    ],
  },
  refund: {
    eyebrow: 'Program Policy',
    title: 'Refund and Feedback Credit Policy',
    updated: 'Draft for the 2026 Founding Cohort',
    sections: [
      ['Founding Price', `The program price is $${program.price}. A participant’s seat is confirmed after payment.`],
      ['Refund Deadline', 'Participants may request a full refund until seven calendar days before the first live workshop. After that deadline, payments are generally nonrefundable because live and individual-feedback capacity has been reserved.'],
      ['Missed Participation', 'Missed workshops, private sessions, unused reviews, withdrawal, or lack of a desired recruiting outcome do not automatically create a refund right.'],
      ['Program Changes', 'If Kelly cancels the entire program, participants receive a full refund. If a material included service cannot be delivered, Kelly will provide a reasonable replacement, rescheduled service, or proportionate refund.'],
      ['Feedback Credit', `Participants may earn a $${program.feedbackCredit} partial refund by completing the published participation and feedback requirements within 14 days after the final workshop. Feedback may be positive, neutral, or critical; a testimonial or employment outcome is not required.`],
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

