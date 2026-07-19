import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { FaqPage, LandingPage, PolicyPage } from './LandingPage.jsx';
import {
  applicationState,
  applicationStepRequiresValidation,
  program,
} from './program.js';
import { ProgramFooter, ProgramHeader } from './siteChrome.jsx';

const programUrl = '/';
const contactEmail = program.contactEmail;
const futureCohortFormUrl = String(
  import.meta.env.VITE_FUTURE_COHORT_FORM_URL || '',
).trim();
const futureCohortEmailUrl =
  `mailto:${contactEmail}?subject=${encodeURIComponent('Future Recruiting Season Accelerator Cohort')}`;

const steps = [
  { id: 'about', label: 'About You' },
  { id: 'direction', label: 'Direction' },
  { id: 'experience', label: 'Experience' },
  { id: 'support', label: 'Support' },
  { id: 'commitment', label: 'Commitment' },
];

const opportunityOptions = [
  'Software Engineering Internship',
  'New-Grad Software Engineering Role',
  'Product Management or Adjacent Exploration',
  'Data or Another Technical-Adjacent Role',
  'Fellowship, Research, or Technical Program',
  'Still Deciding',
  'Other',
];

const environmentOptions = [
  'Big Tech',
  'Fintech',
  'Payments',
  'Banks or Financial Institutions',
  'Technology-Forward Financial Firms',
  'Mature Private Technology Companies',
  'High-Growth Startups',
  'Early-Stage Startups',
  'Open to Multiple Environments',
  'Unsure',
];

const supportOptions = [
  'Resume Positioning',
  'Application Strategy',
  'Target-Company Selection',
  'LinkedIn Profile',
  'Networking and Mentorship',
  'Career Direction',
  'SWE Versus PM Exploration',
  'Project or Experience Planning',
  'Behavioral Interview Preparation',
  'Interview-Conversion Strategy',
  'Recruiting Accountability',
  'Offer Evaluation Preparation',
];

const experienceOptions = [
  'Preparing for my first serious recruiting cycle',
  'Applied before but received few responses',
  'Received interviews but have not converted them into offers',
  'Previously completed an internship and am targeting the next opportunity',
  'Recruiting for a new-grad role',
  'Deciding which roles or companies to pursue',
];

function CheckboxGroup({ legend, name, options, help, max }) {
  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>
      {help ? <p className="field-help">{help}</p> : null}
      <div className="choice-grid">
        {options.map((option) => (
          <label className="choice" key={option}>
            <input type="checkbox" name={name} value={option} data-max={max || undefined} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TextField({ label, name, type = 'text', required = true, hint, ...props }) {
  return (
    <label className="field">
      <span>
        {label} {!required ? <em>Optional</em> : null}
      </span>
      {hint ? <small>{hint}</small> : null}
      <input type={type} name={name} required={required} {...props} />
    </label>
  );
}

function TextArea({ label, name, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {hint ? <small>{hint}</small> : null}
      <textarea name={name} rows="5" required />
    </label>
  );
}

function Turnstile({ onToken }) {
  const container = useRef(null);
  const widgetId = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return undefined;

    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !container.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        callback: onToken,
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
        theme: 'light',
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(interval);
          renderWidget();
        }
      }, 200);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
      if (window.turnstile && widgetId.current !== null) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onToken, siteKey]);

  if (!siteKey) {
    return (
      <p className="configuration-note">
        Submission protection is being configured. You can review the application now,
        but submission will remain unavailable until launch.
      </p>
    );
  }

  return <div className="turnstile" ref={container} aria-label="Spam protection" />;
}

function ApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [supportCount, setSupportCount] = useState(0);
  const formRef = useRef(null);
  const state = useMemo(() => applicationState(), []);
  const canSubmit = state === 'open' && Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

  const validateStep = () => {
    const panel = formRef.current?.querySelector(`[data-step="${currentStep}"]`);
    const controls = panel ? [...panel.querySelectorAll('input, select, textarea')] : [];
    const invalidControl = controls.find((control) => !control.checkValidity());

    if (invalidControl) {
      invalidControl.reportValidity();
      invalidControl.focus();
      return false;
    }

    if (currentStep === 1) {
      const opportunities = panel.querySelectorAll(
        'input[name="opportunities"]:checked',
      ).length;
      const environments = panel.querySelectorAll(
        'input[name="companyEnvironments"]:checked',
      ).length;
      if (!opportunities || !environments) {
        setMessage('Choose at least one opportunity and one company environment.');
        return false;
      }
    }

    if (currentStep === 3 && supportCount === 0) {
      setMessage('Choose at least one area where you would like support.');
      return false;
    }

    setMessage('');
    return true;
  };

  const goNext = () => {
    if (applicationStepRequiresValidation(state) && !validateStep()) return;
    setMessage('');
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChoices = (event) => {
    if (event.target.name !== 'desiredSupport') return;
    const checked = formRef.current.querySelectorAll(
      'input[name="desiredSupport"]:checked',
    );
    if (checked.length > 3) {
      event.target.checked = false;
      setMessage('Choose up to three support areas.');
    } else {
      setSupportCount(checked.length);
      setMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep() || !canSubmit || !turnstileToken) {
      setMessage(
        state === 'open'
          ? 'Complete the spam-protection check before submitting.'
          : 'Applications are not currently accepting submissions.',
      );
      return;
    }

    setStatus('submitting');
    setMessage('');
    const data = new FormData(event.currentTarget);
    data.set('cf-turnstile-response', turnstileToken);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit your application.');
      setStatus('success');
      setMessage(result.reference ? `Confirmation: ${result.reference}` : '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
      if (window.turnstile) window.turnstile.reset();
      setTurnstileToken('');
    }
  };

  if (status === 'success') {
    return (
      <main className="success-page">
        <section className="success-card">
          <span className="success-mark" aria-hidden="true">✓</span>
          <p className="eyebrow">Application Received</p>
          <h1>Thank You for Applying.</h1>
          <p>
            Kelly will review applications after the August 2 deadline. Decisions will
            be shared August 3–5 using the email address you provided.
          </p>
          {message ? <p className="reference">{message}</p> : null}
          <a className="button" href={programUrl}>Return to Program Details</a>
        </section>
      </main>
    );
  }

  if (state === 'closed') {
    return (
      <main className="success-page">
        <section className="success-card">
          <p className="eyebrow">Founding Cohort</p>
          <h1>Applications Are Now Closed.</h1>
          {futureCohortFormUrl ? (
            <p>
              Join the future cohort interest list to receive updates when the next
              application window is announced.
            </p>
          ) : (
            <>
              <p>
                The future cohort interest form is being prepared. For now, email Kelly
                if you would like to be notified when the next cohort is announced.
              </p>
              <p className="configuration-note">
                <strong>Future Cohort Interest Form:</strong> Coming soon.
              </p>
            </>
          )}
          <div className="button-row">
            {futureCohortFormUrl ? (
              <a
                className="button"
                href={futureCohortFormUrl}
                target="_blank"
                rel="noreferrer"
              >
                Join the Future Cohort List
              </a>
            ) : (
              <a className="button" href={futureCohortEmailUrl}>Request Future Cohort Updates</a>
            )}
            <a className="text-link" href={programUrl}>Return to Program Details</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="application-page">
      <ProgramHeader compact applicationPage />

      <main className="application-shell">
        <aside className="application-intro">
          <p className="eyebrow">Founding Cohort Application</p>
          <h1>Tell Us Where You Are—and Where You Want to Go.</h1>
          <p className="intro-copy">
            Help Kelly understand your goals, where recruiting feels stuck, and whether
            this four-week program is the right fit.
          </p>

          <dl className="program-facts">
            <div><dt>Time</dt><dd>7–10 minutes</dd></div>
            <div><dt>Deadline</dt><dd>August 2 · 11:59 PM ET</dd></div>
            <div><dt>Program</dt><dd>Week of August 10</dd></div>
            <div><dt>Price</dt><dd>$99 if accepted</dd></div>
          </dl>

          <div className="privacy-note">
            <strong>Your Information Is Handled With Care.</strong>
            <p>
              It is used to evaluate and operate the program and is never sold.
              Payment information is not collected here.
            </p>
          </div>
        </aside>

        <section className="form-card" aria-labelledby="form-heading">
          <div className="form-heading">
            <div>
              <span>Step {currentStep + 1} of {steps.length}</span>
              <h2 id="form-heading">{steps[currentStep].label}</h2>
            </div>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>

          <ol className="progress" aria-label="Application progress">
            {steps.map((step, index) => (
              <li key={step.id} className={index <= currentStep ? 'active' : ''}>
                <span>{index + 1}</span>
                <small>{step.label}</small>
              </li>
            ))}
          </ol>

          {state === 'opening-soon' ? (
            <div className="opening-note" role="status">
              <strong>Applications Open July 22.</strong>
              You can browse all five steps without entering information. Required-field
              checks and submission will activate when the application window opens.
            </div>
          ) : null}

          <form ref={formRef} onSubmit={handleSubmit} onChange={handleChoices}>
            <div className={currentStep === 0 ? 'step-panel active' : 'step-panel'} data-step="0">
              <div className="field-row">
                <TextField label="Full Name" name="fullName" autoComplete="name" />
                <TextField label="Email Address" name="email" type="email" autoComplete="email" />
              </div>
              <div className="field-row">
                <TextField label="School" name="school" autoComplete="organization" />
                <TextField label="Major or Program" name="major" />
              </div>
              <div className="field-row">
                <TextField label="Expected Graduation Year" name="graduationYear" type="number" min="2026" max="2032" />
                <label className="field">
                  <span>Time Zone</span>
                  <select name="timeZone" required defaultValue="">
                    <option value="" disabled>Select Your Time Zone</option>
                    <option>Eastern Time</option>
                    <option>Central Time</option>
                    <option>Mountain Time</option>
                    <option>Pacific Time</option>
                    <option>Outside the United States</option>
                  </select>
                </label>
              </div>
              <TextField label="LinkedIn Profile URL" name="linkedInUrl" type="url" placeholder="https://www.linkedin.com/in/..." />
              <TextField label="Portfolio or GitHub URL" name="portfolioUrl" type="url" required={false} />
              <label className="field">
                <span>Resume <em>PDF · 5 MB maximum</em></span>
                <input type="file" name="resume" accept=".pdf,application/pdf" required />
              </label>
              <label className="confirmation">
                <input type="checkbox" name="isAdult" value="yes" required />
                <span>I confirm that I am at least 18 years old.</span>
              </label>
            </div>

            <div className={currentStep === 1 ? 'step-panel active' : 'step-panel'} data-step="1">
              <CheckboxGroup
                legend="Which opportunities are you pursuing?"
                name="opportunities"
                options={opportunityOptions}
                help="Choose all that apply."
              />
              <CheckboxGroup
                legend="Which company environments interest you?"
                name="companyEnvironments"
                options={environmentOptions}
                help="Choose all that apply."
              />
            </div>

            <div className={currentStep === 2 ? 'step-panel active' : 'step-panel'} data-step="2">
              <label className="field">
                <span>Which best describes your current experience?</span>
                <select name="currentExperience" required defaultValue="">
                  <option value="" disabled>Select One</option>
                  {experienceOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <TextArea
                label="Briefly describe what you have tried so far and what happened."
                name="recruitingHistory"
              />
              <TextArea
                label="What is your most important recruiting or career goal for the next three months?"
                name="threeMonthGoal"
              />
              <TextArea
                label="What do you believe is currently preventing you from reaching it?"
                name="primaryObstacle"
              />
            </div>

            <div className={currentStep === 3 ? 'step-panel active' : 'step-panel'} data-step="3">
              <TextArea
                label="What would need to change during these four weeks for the program to feel worthwhile?"
                name="worthwhileChange"
              />
              <TextArea
                label="What is the single most important area where you want Kelly’s personal feedback?"
                name="feedbackPriority"
              />
              <TextArea
                label="Why is this the right program for you at this point in your recruiting journey?"
                name="programFit"
              />
              <CheckboxGroup
                legend="Where would you most like support?"
                name="desiredSupport"
                options={supportOptions}
                help={`Choose up to three. ${supportCount}/3 selected.`}
                max="3"
              />
            </div>

            <div className={currentStep === 4 ? 'step-panel active' : 'step-panel'} data-step="4">
              <fieldset className="commitments">
                <legend>Availability and Commitment</legend>
                {[
                  ['attendWorkshops', 'I can attend at least three of the four weekly live workshops.'],
                  ['completeWork', 'I can complete approximately one to two hours of focused work outside each workshop.'],
                  ['submitFeedback', 'I am willing to submit weekly progress and resource feedback.'],
                  ['understandPrice', 'I understand that the program is paid and costs $99.'],
                  ['understandNoGuarantee', 'I understand that interviews, referrals, internships, and offers are not guaranteed.'],
                  ['understandSelection', 'I understand that applying does not guarantee acceptance.'],
                  ['understandIndependence', 'I understand that this program is independent from Bloomberg and Kelly’s current or former employers.'],
                ].map(([name, label]) => (
                  <label className="confirmation" key={name}>
                    <input type="checkbox" name={name} value="yes" required />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>

              <label className="field">
                <span>How did you hear about the program?</span>
                <select name="referralSource" required defaultValue="">
                  <option value="" disabled>Select One</option>
                  <option>Kelly&apos;s LinkedIn post</option>
                  <option>Direct message from Kelly</option>
                  <option>Friend or participant referral</option>
                  <option>University or student organization</option>
                  <option>ApplyFirst</option>
                  <option>The Unspoken Playbook</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="confirmation optional-consent">
                <input type="checkbox" name="marketingConsent" value="yes" />
                <span>I would like to receive future ApplyFirst resource and cohort announcements. <em>Optional</em></span>
              </label>

              <Turnstile onToken={setTurnstileToken} />

              <p className="legal-copy">
                By submitting, you confirm that the information is accurate and agree
                that Kelly may use it to evaluate and operate the program. Questions?
                Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
              </p>
            </div>

            {message ? <p className={status === 'error' ? 'form-message error' : 'form-message'} role="alert">{message}</p> : null}

            <div className="form-actions">
              {currentStep > 0 ? (
                <button type="button" className="button secondary" onClick={() => {
                  setMessage('');
                  setCurrentStep((step) => step - 1);
                }}>
                  Back
                </button>
              ) : <span />}
              {currentStep < steps.length - 1 ? (
                <button type="button" className="button" onClick={goNext}>Continue</button>
              ) : (
                <button type="submit" className="button" disabled={status === 'submitting' || !canSubmit}>
                  {status === 'submitting'
                    ? 'Submitting…'
                    : state === 'opening-soon'
                      ? 'Opens July 22'
                      : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </section>
      </main>

      <ProgramFooter />
    </div>
  );
}

function Router() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const titles = {
    '/': 'Recruiting Season Accelerator | Kelly Chen',
    '/apply': 'Apply | Recruiting Season Accelerator',
    '/terms': 'Participant Terms | Recruiting Season Accelerator',
    '/privacy': 'Privacy Notice | Recruiting Season Accelerator',
    '/refund': 'Refund Policy | Recruiting Season Accelerator',
    '/faq': 'FAQ | Recruiting Season Accelerator',
  };
  document.title = titles[path] || titles['/'];

  if (path === '/apply') return <ApplicationPage />;
  if (path === '/terms') return <PolicyPage type="terms" />;
  if (path === '/privacy') return <PolicyPage type="privacy" />;
  if (path === '/refund') return <PolicyPage type="refund" />;
  if (path === '/faq') return <FaqPage />;
  return <LandingPage />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
