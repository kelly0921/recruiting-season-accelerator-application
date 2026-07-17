import React from 'react';
import { applicationAction, applicationState, program } from './program.js';

export function ProgramHeader({ compact = false }) {
  const action = applicationAction(applicationState());

  return (
    <header className={compact ? 'site-header compact' : 'site-header'}>
      <a className="brand" href="/" aria-label={`${program.name} home`}>
        <span><img src="/kelly-logo.svg" alt="" /></span>
        <strong>{program.name}</strong>
      </a>
      <nav className="program-nav" aria-label="Program navigation">
        <a href="/#fit">Who it&apos;s for</a>
        <a href="/#program">Program</a>
        <a href="/#timeline">Timeline</a>
        <a href="/faq">FAQ</a>
      </nav>
      <a className="header-cta" href={action.href}>{action.label}</a>
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
