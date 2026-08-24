import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { FaqPage, LandingPage, PolicyPage } from './LandingPage.jsx';
import { applicationStepRequiresValidation, program } from './program.js';
import { ProgramFooter, ProgramHeader } from './siteChrome.jsx';
import { useApplicationState } from './useApplicationState.js';
import {
  academicStageOptions,
  conferenceInterestOptions,
  obstacleOptions,
  opportunityOptions,
  preferredTimingOptions,
  rolePathOptions,
} from '../shared/applicationOptions.js';

const programUrl = '/';
const contactEmail = program.contactEmail;

const steps = [
  { id: 'about', label: 'About You' },
  { id: 'goals', label: 'Goals and Fit' },
  { id: 'commitment', label: 'Commitment' },
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

function TextArea({ label, name, hint, required = true, ...props }) {
  return (
    <label className="field">
      <span>
        {label} {!required ? <em>Optional</em> : null}
      </span>
      {hint ? <small>{hint}</small> : null}
      <textarea name={name} rows="5" required={required} {...props} />
    </label>
  );
}

function Turnstile({ action, onToken, onError, configurationMessage }) {
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
        action,
        callback: onToken,
        'expired-callback': () => {
          onToken('');
          if (widgetId.current !== null) {
            window.turnstile.reset(widgetId.current);
          }
        },
        'error-callback': () => {
          onToken('');
          onError?.();
        },
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
  }, [action, onError, onToken, siteKey]);

  if (!siteKey) {
    return (
      <p className="configuration-note">
        {configurationMessage || (
          <>
            Submission protection is being configured. You can review the application now,
            but submission will remain unavailable until launch.
          </>
        )}
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
  const [turnstileVersion, setTurnstileVersion] = useState(0);
  const [obstacleCount, setObstacleCount] = useState(0);
  const formRef = useRef(null);
  const state = useApplicationState();
  const canSubmit = state === 'open' && Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const handleTurnstileError = useCallback(() => {
    setMessage(
      'Cloudflare verification could not load. Refresh the check or reload the page and try again.',
    );
  }, []);

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
      const roles = panel.querySelectorAll(
        'input[name="rolesExploring"]:checked',
      ).length;
      const obstacles = panel.querySelectorAll(
        'input[name="obstacles"]:checked',
      ).length;
      if (!roles || !obstacles) {
        setMessage('Choose at least one role or path and one current obstacle.');
        return false;
      }
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
    if (event.target.name !== 'obstacles') return;
    const checked = formRef.current.querySelectorAll(
      'input[name="obstacles"]:checked',
    );
    if (checked.length > 2) {
      event.target.checked = false;
      setMessage('Choose up to two current obstacles.');
    } else {
      setObstacleCount(checked.length);
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
      if (result.reference) {
        setMessage(
          result.confirmationEmailSent
            ? `Confirmation: ${result.reference} · A receipt was sent to your email.`
            : `Confirmation: ${result.reference} · Your application is saved, but the receipt email could not be sent. Please keep this number.`,
        );
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
      setTurnstileToken('');
      setTurnstileVersion((version) => version + 1);
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
            Kelly plans to send mentorship and alternate decisions on September 3 using
            the email address you provided. Selected participants will receive private
            onboarding steps before September 14.
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
          <p>
            Join the future cohort interest list to receive updates when the next
            application window is announced.
          </p>
          <div className="button-row">
            <a className="button" href="/interest">Join the Future Cohort List</a>
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
            Current college students from every class year may apply. Share the goal
            you want to move forward and how you have already begun taking action.
          </p>

          <dl className="program-facts">
            <div><dt>Time</dt><dd>About 7–10 minutes</dd></div>
            <div><dt>Deadline</dt><dd>August 31 · 11:59 PM ET</dd></div>
            <div><dt>Cohort</dt><dd>September 14–December 15</dd></div>
            <div><dt>Price</dt><dd>Free founding pilot</dd></div>
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
          <p className="required-fields-note">All fields are required unless marked Optional.</p>

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
              <strong>Applications Open August 24.</strong>
              You can browse all three steps without entering information. Required-field
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
                <TextField label="Academic Area or Program" name="major" />
              </div>
              <div className="field-row">
                <TextField
                  label="Expected Graduation Month and Year"
                  name="graduationDate"
                  type="month"
                  min="2026-08"
                  max="2032-12"
                />
                <label className="field">
                  <span>Fall 2026 College Year</span>
                  <select name="academicStage" required defaultValue="">
                    <option value="" disabled>Select One</option>
                    {academicStageOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </div>
              <label className="confirmation">
                <input type="checkbox" name="isAdult" value="yes" required />
                <span>I confirm that I will be at least 18 years old when the program begins.</span>
              </label>
              <TextField
                label="LinkedIn Profile URL"
                name="linkedInUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/..."
              />
              <label className="field">
                <span>Resume <em>PDF · 5 MB maximum</em></span>
                <input type="file" name="resume" accept=".pdf,application/pdf" required />
              </label>
            </div>

            <div className={currentStep === 1 ? 'step-panel active' : 'step-panel'} data-step="1">
              <CheckboxGroup
                legend="Which roles or paths are you currently exploring?"
                name="rolesExploring"
                options={rolePathOptions}
                help="Choose all that apply."
              />
              <TextArea
                label="What is the most important career or opportunity goal you want to make progress on this fall?"
                name="fallGoal"
                hint="Aim for approximately 50–100 words."
                minLength="80"
                maxLength="1200"
              />
              <CheckboxGroup
                legend="What is currently making that goal difficult?"
                name="obstacles"
                options={obstacleOptions}
                help={`Choose up to two. ${obstacleCount}/2 selected.`}
                max="2"
              />
              <TextArea
                label="Tell us about one concrete action you have taken toward a career goal during the past 30 days."
                name="recentAction"
                hint="Aim for approximately 50–100 words."
                minLength="80"
                maxLength="1200"
              />
              <TextArea
                label="What is one question or decision you most want Kelly’s help with?"
                name="kellyQuestion"
                hint="Aim for approximately 50–100 words."
                minLength="80"
                maxLength="1200"
              />
              <label className="field">
                <span>Which statement best describes your current conference plans?</span>
                <small className="field-help">Conference attendance is not required, but interest or acceptance helps Kelly understand program fit. This does not register you for conference materials.</small>
                <select name="conferenceInterest" required defaultValue="">
                  <option value="" disabled>Select One</option>
                  {conferenceInterestOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <div className={currentStep === 2 ? 'step-panel active' : 'step-panel'} data-step="2">
              <fieldset className="commitments">
                <legend>Participation Expectations</legend>
                {[
                  ['groupSessionCommitment', 'I can attend at least three of four virtual group sessions. Final times will be selected based on accepted participants’ availability.'],
                  ['individualSessionCommitment', 'During the intensive, I can schedule one 60-minute resume review and one 60-minute strategy session.'],
                  ['weeklyWorkCommitment', 'From September 14–October 11, I can commit approximately one to two hours per week to the four-week intensive.'],
                  ['applyFirstCommitment', 'From October 12–December 15, I can attend one monthly group check-in, complete a short ApplyFirst feedback prompt approximately every two weeks, and provide conference feedback around my event dates when relevant.'],
                  ['programAcknowledgement', 'I understand that applying does not guarantee acceptance and the program does not guarantee referrals, interviews, internships, conference acceptance, funding, or jobs.'],
                ].map(([name, label]) => (
                  <label className="confirmation" key={name}>
                    <input type="checkbox" name={name} value="yes" required />
                    <span>{label}</span>
                  </label>
                ))}
                <label className="confirmation">
                  <input type="checkbox" name="termsAcknowledgement" value="yes" required />
                  <span>
                    I have read and agree to the{' '}
                    <a href="/terms" target="_blank" rel="noreferrer" aria-label="Participant Terms (opens in a new tab)">
                      Participant Terms
                    </a>{' '}
                    and acknowledge the{' '}
                    <a href="/privacy" target="_blank" rel="noreferrer" aria-label="Privacy Notice (opens in a new tab)">
                      Privacy Notice
                    </a>, including that this program is independent from Kelly’s current
                    and former employers.
                  </span>
                </label>
              </fieldset>

              {currentStep === 2 ? (
                <Turnstile
                  key={turnstileVersion}
                  action="application_submit"
                  onToken={setTurnstileToken}
                  onError={handleTurnstileError}
                />
              ) : null}

              <p className="legal-copy">
                By submitting, you confirm that the information is accurate and agree
                that Kelly may use it to evaluate and operate the program under the{' '}
                <a href="/privacy">Privacy Notice</a>. Participation is also subject to
                the <a href="/terms">Participant Terms</a>. Questions? Email{' '}
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
              </p>
            </div>

            {message ? <p className={status === 'error' ? 'form-message error' : 'form-message'} role="alert">{message}</p> : null}

            <div className="form-actions">
              {currentStep > 0 ? (
                <button type="button" className="button secondary" onClick={() => {
                  setMessage('');
                  if (currentStep === 2) setTurnstileToken('');
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
                      ? 'Opens August 24'
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

function FutureInterestPage() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileVersion, setTurnstileVersion] = useState(0);
  const canSubmit = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const handleTurnstileError = useCallback(() => {
    setMessage(
      'Cloudflare verification could not load. Refresh the check or reload the page and try again.',
    );
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit || !turnstileToken) {
      setMessage('Complete the spam-protection check before joining the list.');
      return;
    }

    setStatus('submitting');
    setMessage('');
    const data = new FormData(event.currentTarget);
    data.set('cf-turnstile-response', turnstileToken);

    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to save your information.');
      }
      setStatus('success');
      setMessage(
        result.alreadyRegistered
          ? 'This email address was already on the list, so no duplicate was created.'
          : '',
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
      setTurnstileToken('');
      setTurnstileVersion((version) => version + 1);
    }
  };

  if (status === 'success') {
    return (
      <main className="success-page">
        <section className="success-card">
          <span className="success-mark" aria-hidden="true">✓</span>
          <p className="eyebrow">Future Cohort</p>
          <h1>You’re on the Future Cohort List.</h1>
          <p>
            Kelly will email you when the next cohort and application window are
            announced. Joining this list is not an application or an acceptance.
          </p>
          {message ? <p className="reference">{message}</p> : null}
          <a className="button" href={programUrl}>Return to Program Details</a>
        </section>
      </main>
    );
  }

  return (
    <div className="application-page interest-page">
      <ProgramHeader compact applicationPage />

      <main className="application-shell interest-shell">
        <aside className="application-intro">
          <p className="eyebrow">Future Cohort Interest</p>
          <h1>Stay in the Loop for What Comes Next.</h1>
          <p className="intro-copy">
            Share a few details so Kelly can let you know when a future Recruiting
            Season Accelerator cohort is announced.
          </p>

          <dl className="program-facts">
            <div><dt>Time</dt><dd>About 2 minutes</dd></div>
            <div><dt>Purpose</dt><dd>Future cohort updates</dd></div>
            <div><dt>Resume</dt><dd>Not required</dd></div>
            <div><dt>Payment</dt><dd>Not collected</dd></div>
          </dl>

          <div className="privacy-note">
            <strong>A Short, Low-Commitment Form.</strong>
            <p>
              This is not the selective program application. Your information is
              used only for future cohort planning and announcements.
            </p>
          </div>
        </aside>

        <section className="form-card interest-card" aria-labelledby="interest-heading">
          <div className="form-heading">
            <div>
              <span>Future Cohort</span>
              <h2 id="interest-heading">Join the Interest List</h2>
            </div>
          </div>
          <p className="required-fields-note">All fields are required unless marked Optional.</p>

          <div className="opening-note" role="note">
            <strong>This Is Not an Application.</strong>
            You will still need to apply when a future cohort opens.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <TextField
                label="Full Name"
                name="fullName"
                autoComplete="name"
                maxLength="120"
              />
              <TextField
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                maxLength="254"
              />
            </div>

            <div className="field-row">
              <TextField
                label="School"
                name="school"
                autoComplete="organization"
                maxLength="200"
                required={false}
              />
              <TextField
                label="Expected Graduation Year"
                name="graduationYear"
                type="number"
                min="2026"
                max="2035"
              />
            </div>

            <label className="field">
              <span>Primary Opportunity Interest</span>
              <select name="opportunityInterest" required defaultValue="">
                <option value="" disabled>Select One</option>
                {opportunityOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label className="field">
              <span>Preferred Cohort Timing <em>Optional</em></span>
              <select name="preferredTiming" defaultValue="">
                <option value="">No Preference</option>
                {preferredTimingOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <TextArea
              label="What Kind of Support Would Be Most Helpful?"
              name="supportNote"
              hint="A short sentence is enough."
              maxLength="1000"
              required={false}
            />

            <label className="confirmation">
              <input type="checkbox" name="announcementConsent" value="yes" required />
              <span>
                I would like to receive future Recruiting Season Accelerator cohort
                announcements by email.
              </span>
            </label>

            <Turnstile
              key={turnstileVersion}
              action="interest_submit"
              onToken={setTurnstileToken}
              onError={handleTurnstileError}
              configurationMessage="Submission protection is being configured. The interest form will be available as soon as setup is complete."
            />

            <p className="legal-copy">
              Your information is never sold. You can request correction, deletion,
              or removal from the list by emailing{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. See the{' '}
              <a href="/privacy">Privacy Notice</a>.
            </p>

            {message ? (
              <p
                className={status === 'error' ? 'form-message error' : 'form-message'}
                role="alert"
              >
                {message}
              </p>
            ) : null}

            <div className="form-actions">
              <a className="text-link" href={programUrl}>Back to Program Details</a>
              <button
                type="submit"
                className="button"
                disabled={status === 'submitting' || !canSubmit}
              >
                {status === 'submitting' ? 'Joining…' : 'Join the Future Cohort List'}
              </button>
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
    '/interest': 'Future Cohort Interest | Recruiting Season Accelerator',
    '/terms': 'Participant Terms | Recruiting Season Accelerator',
    '/privacy': 'Privacy Notice | Recruiting Season Accelerator',
    '/refund': 'Cost and Participation Policy | Recruiting Season Accelerator',
    '/faq': 'FAQ | Recruiting Season Accelerator',
  };
  document.title = titles[path] || titles['/'];

  if (path === '/apply') return <ApplicationPage />;
  if (path === '/interest') return <FutureInterestPage />;
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
