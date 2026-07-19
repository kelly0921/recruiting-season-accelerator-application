import React, { useEffect, useState } from 'react';
import { applicationAction, applicationState, program } from './program.js';

const shortcuts = [
  ['fit', 'Who it\u0027s for'],
  ['program', 'Program'],
  ['timeline', 'Timeline'],
  ['faq', 'FAQ'],
];

export function ProgramHeader({ compact = false, applicationPage = false }) {
  const action = applicationAction(applicationState());
  const [activeSection, setActiveSection] = useState(
    () => (window.location.pathname === '/faq' ? 'faq' : ''),
  );
  const headerAction = applicationPage
    ? { label: 'Back to Program', href: '/' }
    : action;
  const shortActionLabel = applicationPage
    ? 'Program'
    : action.label === 'Apply for the Founding Cohort'
      ? 'Apply now'
      : action.label === 'Preview the Application'
        ? 'Preview'
        : 'Closed';

  useEffect(() => {
    if (window.location.pathname !== '/') return undefined;

    const updateActiveSection = () => {
      const threshold = 150;
      let current = '';

      shortcuts.forEach(([id]) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= threshold) current = id;
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        current = 'faq';
      }

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  return (
    <header className={compact ? 'site-header compact' : 'site-header'}>
      <div className="brand-lockup">
        <a className="brand brand-mark-link" href="/" aria-label={`${program.name} home`}>
          <span><img src="/kelly-logo.svg" alt="" /></span>
        </a>
        <div className="brand-copy">
          <a className="program-name" href="/" aria-label={program.name}>
            <span className="program-name-full">{program.name}</span>
            <span className="program-name-short" aria-hidden="true">Recruiting Accelerator</span>
          </a>
          <a className="brand-by" href={program.portfolioUrl}>by Kelly Chen <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <nav className="program-nav" aria-label="Program navigation">
        {shortcuts.map(([id, label]) => (
          <a
            key={id}
            className={activeSection === id ? 'active' : undefined}
            href={`/#${id}`}
            aria-current={activeSection === id ? 'location' : undefined}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="header-cta" href={headerAction.href}>
          <span className="cta-full">{headerAction.label}</span>
          <span className="cta-short">{shortActionLabel}</span>
        </a>
        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav aria-label="Mobile program navigation">
            {shortcuts.map(([id, label]) => (
              <a
                key={id}
                className={activeSection === id ? 'active' : undefined}
                href={`/#${id}`}
                aria-current={activeSection === id ? 'location' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

export function ProgramFooter() {
  return (
    <footer className="program-footer">
      <div>
        <a className="brand footer-brand" href="/">
          <span><img src="/kelly-logo.svg" alt="" /></span>
          <strong>{program.name}</strong>
        </a>
        <p>
          Independent educational and mentorship program operated by Kelly Chen.
          Not affiliated with or endorsed by Bloomberg or any current or former employer.
        </p>
      </div>
      <nav aria-label="Program policies">
        <a href="/terms">Participant Terms</a>
        <a href="/privacy">Privacy</a>
        <a href="/refund">Refund Policy</a>
        <a href={`mailto:${program.contactEmail}`}>Contact</a>
      </nav>
    </footer>
  );
}
