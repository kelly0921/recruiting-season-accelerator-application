import React from 'react';
import { applicationAction, applicationState, program } from './program.js';

export function ProgramHeader({ compact = false, applicationPage = false }) {
  const action = applicationAction(applicationState());
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

  return (
    <header className={compact ? 'site-header compact' : 'site-header'}>
      <div className="brand-lockup">
        <a className="brand brand-mark-link" href="/" aria-label={`${program.name} home`}>
          <span><img src="/kelly-logo.svg" alt="" /></span>
        </a>
        <div className="brand-copy">
          <a className="program-name" href="/">{program.name}</a>
          <a className="brand-by" href={program.portfolioUrl}>by Kelly Chen <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <nav className="program-nav" aria-label="Program navigation">
        <a href="/#fit">Who it&apos;s for</a>
        <a href="/#program">Program</a>
        <a href="/#timeline">Timeline</a>
        <a href="/#faq">FAQ</a>
      </nav>
      <div className="header-actions">
        <a className="header-cta" href={headerAction.href}>
          <span className="cta-full">{headerAction.label}</span>
          <span className="cta-short">{shortActionLabel}</span>
        </a>
        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav aria-label="Mobile program navigation">
            <a href="/#fit">Who it&apos;s for</a>
            <a href="/#program">Program</a>
            <a href="/#timeline">Timeline</a>
            <a href="/#faq">FAQ</a>
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
