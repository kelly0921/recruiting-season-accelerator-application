import React from 'react';
import { applicationAction, applicationState, program } from './program.js';
import { ProgramFooter, ProgramHeader } from './siteChrome.jsx';

const bottlenecks = [
  ['Positioning', 'Your experience is stronger than the story your resume currently tells.'],
  ['Targeting', 'You are applying, but your role and company strategy is too broad—or too narrow.'],
  ['Conversion', 'You are getting some traction but do not know where the process is breaking down.'],
  ['Prioritization', 'You have options and advice, but no clear sequence for what to improve first.'],
];

const included = [
  ['4', 'Weekly workshops', 'Four live, 60-minute Zoom sessions built around focused exercises—not passive lectures.'],
  ['3', 'Private sessions', 'An initial diagnosis, midpoint course correction, and final continuation strategy.'],
  ['01', 'Written resume review', 'Specific feedback on positioning, clarity, and the story your experience communicates.'],
  ['01', 'Personalized review', 'Feedback on the additional asset or strategy most connected to your recruiting bottleneck.'],
  ['04', 'Weeks of support', 'Private Slack, weekly accountability, and ApplyFirst tools used throughout the program.'],
  ['01', 'Future offer session', 'A founding-participant strategy session for your next internship or new-grad offer.'],
];

const journey = [
  ['Week 1', 'Diagnose', 'Clarify your target and identify the bottleneck with the greatest leverage.'],
  ['Week 2', 'Position', 'Strengthen your resume, experience framing, and career story.'],
  ['Week 3', 'Apply and adjust', 'Build a smarter target-company, application, and networking system.'],
  ['Week 4', 'Continue', 'Interpret results and leave with a focused 60- or 90-day recruiting plan.'],
];

const outcomes = [
  'A personalized recruiting diagnosis',
  'A clearer target role and company strategy',
  'An improved resume',
  'A prioritized recruiting system',
  'Personalized feedback on an additional career asset',
  'A written 60- or 90-day action plan',
];

export const faqs = [
  {
    question: 'Who is the program designed for?',
    answer:
      'Primarily sophomores, juniors, and seniors pursuing software engineering internships or new-grad roles. Selective freshmen who are at least 18 and already have meaningful technical or recruiting experience may also apply.',
  },
  {
    question: 'Is this a coding or technical interview course?',
    answer:
      'No. The program focuses on recruiting strategy, positioning, target selection, organization, storytelling, networking, behavioral preparation, and diagnosing low response or conversion patterns.',
  },
  {
    question: 'What happens after I apply?',
    answer:
      `Applications close August 2 at 11:59 PM ET. Decisions are planned for ${program.decisionDates}. Accepted applicants receive private payment and onboarding instructions.`,
  },
  {
    question: 'Does applying or participating guarantee an interview or offer?',
    answer:
      'No. The program provides education, feedback, strategy, and accountability. It does not guarantee referrals, interviews, internships, offers, compensation, or employment outcomes.',
  },
  {
    question: 'How does the $20 feedback credit work?',
    answer:
      'Participants who complete the published participation and feedback requirements within 14 days after the final workshop may receive a $20 partial refund. Feedback may be positive, neutral, or critical.',
  },
  {
    question: 'Is this connected to Bloomberg or Kelly’s employers?',
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

export function LandingPage() {
  const state = applicationState();
  const effectivePrice = program.price - program.feedbackCredit;

  return (
    <div className="program-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className={`announcement ${state}`}>
        <span>Founding cohort · {program.capacity} students maximum</span>
        <strong>
          {state === 'opening-soon'
            ? 'Applications open July 22'
            : state === 'open'
              ? 'Applications close August 2 at 11:59 PM ET'
              : 'Founding cohort applications are closed'}
        </strong>
      </div>
      <ProgramHeader />

      <main id="main-content">
        <section className="program-hero">
          <div className="landing-shell hero-layout">
            <div className="program-hero-copy">
              <p className="eyebrow">A focused four-week recruiting reset</p>
              <h1>Recruiting season is here. <em>Apply with a strategy.</em></h1>
              <p className="hero-lede">
                Personalized mentorship for college students pursuing software
                engineering internships and new-grad roles—especially across big tech,
                fintech, payments, and competitive technical environments.
              </p>
              <div className="hero-actions">
                <ApplicationButton />
                <a className="text-link" href="#program">See what&apos;s included</a>
              </div>
              <p className="hero-microcopy">
                Application-based · $99 founding price · No payment collected when applying
              </p>
            </div>

            <aside className="strategy-card" aria-label="Program strategy">
              <div className="strategy-card-heading">
                <span>Four-week strategy brief</span>
                <small>Founding cohort</small>
              </div>
              <ol>
                <li><span>01</span><div><strong>Diagnose</strong><small>Find the real recruiting bottleneck.</small></div></li>
                <li><span>02</span><div><strong>Position</strong><small>Strengthen your resume and story.</small></div></li>
                <li><span>03</span><div><strong>Apply</strong><small>Build a focused opportunity system.</small></div></li>
                <li><span>04</span><div><strong>Adjust</strong><small>Use results to decide what comes next.</small></div></li>
              </ol>
              <div className="strategy-card-result">
                <span>Leave with</span>
                <strong>A personalized 60- or 90-day plan</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="snapshot" aria-labelledby="snapshot-title">
          <div className="landing-shell snapshot-layout">
            <div>
              <p className="eyebrow">Program at a glance</p>
              <h2 id="snapshot-title">Small by design. Structured for momentum.</h2>
              <p>A deliberately limited cohort creates room for useful context, direct feedback, and individual strategy.</p>
            </div>
            <dl className="snapshot-grid">
              <div><dt>4</dt><dd>Weekly workshops</dd><small>Live, focused, practical</small></div>
              <div><dt>3</dt><dd>Private sessions</dd><small>Personalized to your bottleneck</small></div>
              <div><dt>6</dt><dd>Students maximum</dd><small>A deliberately small cohort</small></div>
              <div><dt>${effectivePrice}</dt><dd>Effective cost</dd><small>After the optional $20 feedback credit</small></div>
            </dl>
          </div>
        </section>

        <section className="landing-section" id="fit" aria-labelledby="fit-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="Start with the bottleneck"
              title="You do not need more generic advice. You need to know what to fix next."
              body="The program is built for students who have already started—but are unsure which change will create the most recruiting leverage."
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
                <p className="eyebrow">A strong fit</p>
                <h3>You are ready to use specific feedback.</h3>
                <ul>
                  <li>You are pursuing a SWE internship or new-grad role.</li>
                  <li>You have a project, coursework, research, program, leadership experience, or prior recruiting attempt.</li>
                  <li>You can complete focused work between sessions.</li>
                  <li>You want clearer priorities—not unlimited access or a shortcut.</li>
                </ul>
              </article>
              <article>
                <p className="eyebrow">Not the right format</p>
                <h3>This is not a beginner coding course or referral service.</h3>
                <ul>
                  <li>No LeetCode curriculum or daily application management</li>
                  <li>No guaranteed referrals, interviews, internships, or offers</li>
                  <li>No immigration, legal, tax, or financial advice</li>
                  <li>No unlimited coaching or done-for-you application materials</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section included-section" id="program" aria-labelledby="program-title">
          <div className="landing-shell">
            <SectionHeading
              eyebrow="What’s included"
              title="A connected recruiting system—not a stack of bonuses."
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
                <p className="eyebrow">The four-week journey</p>
                <h3>From uncertainty to a focused continuation plan.</h3>
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
              eyebrow="Leave with direction"
              title="Know what is limiting your progress—and what to do next."
              id="outcomes-title"
            />
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
            <div className="founder-mark" aria-hidden="true"><span>KC</span></div>
            <div>
              <p className="eyebrow">Your mentor</p>
              <h2 id="founder-title">Strategy shaped by engineering, fintech, and student community work.</h2>
              <p>
                Kelly Chen is a software engineer, product builder, speaker, and community
                leader whose experience spans Visa, JPMorgan Chase, Bloomberg, early-career
                programs, and student mentorship. The program translates that context into
                practical frameworks—not employer access.
              </p>
              <div className="experience-row" aria-label="Experience informing the program">
                <strong>Visa</strong><strong>JPMorgan Chase</strong><strong>Bloomberg</strong>
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
              eyebrow="Founding cohort"
              title="One transparent price. Personalized support throughout."
              id="pricing-title"
            />
            <div className="price-card">
              <span>Founding price</span>
              <strong>${program.price}</strong>
              <p>Paid privately after acceptance. There is no public checkout.</p>
              <div><span>Optional feedback credit</span><strong>−${program.feedbackCredit}</strong></div>
              <div><span>Effective cost after credit</span><strong>${effectivePrice}</strong></div>
              <ApplicationButton label="Review the Application" />
              <small>No scholarship seats are available for this founding cohort.</small>
            </div>
          </div>
        </section>

        <section className="landing-section timeline-section" id="timeline" aria-labelledby="timeline-title">
          <div className="landing-shell">
            <SectionHeading eyebrow="Important dates" title="A short application window before recruiting accelerates." id="timeline-title" />
            <ol className="date-timeline">
              <li><span>01</span><div><strong>Applications</strong><time>{program.applicationDates}</time></div></li>
              <li><span>02</span><div><strong>Decisions</strong><time>{program.decisionDates}</time></div></li>
              <li><span>03</span><div><strong>Program begins</strong><time>{program.startDate}</time></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="landing-shell faq-layout">
            <SectionHeading eyebrow="Questions" title="Know what you are applying for." id="faq-title" />
            <div className="faq-list">
              {faqs.slice(0, 5).map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
              <a className="text-link" href="/faq">View all program questions</a>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="landing-shell">
            <p className="eyebrow">Founding cohort · {program.capacity} students maximum</p>
            <h2>Build your recruiting strategy before the season gets away from you.</h2>
            <p>Review the questions, prepare your resume, and tell Kelly what you need help solving.</p>
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
    eyebrow: 'Program policy',
    title: 'Participant Terms',
    updated: 'Draft for the 2026 founding cohort',
    sections: [
      ['Program and operator', `Recruiting Season Accelerator is a four-week educational and mentorship program operated by Kelly Chen. Questions may be sent to ${program.contactEmail}.`],
      ['Enrollment and price', `The founding-cohort price is $${program.price}. Applying does not guarantee acceptance, and a seat is confirmed only after acceptance and private payment.`],
      ['Included support', 'The program includes four workshops, three private sessions, a written resume review, one additional personalized review, Slack support, ApplyFirst resources, a continuation plan, and one future offer-strategy session. Themes may adapt without materially reducing the promised support.'],
      ['Participant responsibility', 'Participants remain responsible for their applications, materials, decisions, attendance, and recruiting outcomes. Materials must be accurate and must not misrepresent experience.'],
      ['No employment guarantee', 'Participation does not guarantee a referral, interview, internship, job offer, compensation level, or other employment outcome.'],
      ['Independent program', 'The program is not affiliated with, sponsored by, or endorsed by Bloomberg or any current or former employer. All guidance is Kelly’s own.'],
    ],
  },
  privacy: {
    eyebrow: 'Program policy',
    title: 'Privacy Notice',
    updated: 'Draft for the 2026 founding cohort',
    sections: [
      ['Information collected', 'The application may collect contact information, school and graduation details, resume and profile links, recruiting goals and history, participation information, and optional feedback or outcome updates.'],
      ['How information is used', 'Information is used to evaluate applications, select and onboard participants, deliver mentorship, operate workshops and support, improve resources, and track aggregate program outcomes.'],
      ['Storage and service providers', 'Cloudflare processes application records and private resume files for this portal. Other program vendors may process payment, scheduling, video, communication, or file information according to their own terms.'],
      ['Your choices', `Information is not sold. Public use of a name, image, quote, school, employer, or outcome requires separate permission. Correction or deletion requests may be sent to ${program.contactEmail}.`],
      ['Retention', 'Rejected application data should generally be deleted within 60–90 days unless the applicant separately joins an updates list. Accepted-participant working files are minimized and removed or anonymized when no longer needed.'],
    ],
  },
  refund: {
    eyebrow: 'Program policy',
    title: 'Refund and Feedback Credit Policy',
    updated: 'Draft for the 2026 founding cohort',
    sections: [
      ['Founding price', `The program price is $${program.price}. A participant’s seat is confirmed after payment.`],
      ['Refund deadline', 'Participants may request a full refund until seven calendar days before the first live workshop. After that deadline, payments are generally nonrefundable because live and individual-feedback capacity has been reserved.'],
      ['Missed participation', 'Missed workshops, private sessions, unused reviews, withdrawal, or lack of a desired recruiting outcome do not automatically create a refund right.'],
      ['Program changes', 'If Kelly cancels the entire program, participants receive a full refund. If a material included service cannot be delivered, Kelly will provide a reasonable replacement, rescheduled service, or proportionate refund.'],
      ['Feedback credit', `Participants may earn a $${program.feedbackCredit} partial refund by completing the published participation and feedback requirements within 14 days after the final workshop. Feedback may be positive, neutral, or critical; a testimonial or employment outcome is not required.`],
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
          <a className="text-link" href="/">← Back to program details</a>
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
          <a className="text-link" href="/">← Back to program details</a>
          <p className="eyebrow">Program questions</p>
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

