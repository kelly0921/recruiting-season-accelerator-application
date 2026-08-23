import { useEffect, useState } from 'react';
import { applicationState, program } from './program.js';

export function useApplicationState() {
  const [state, setState] = useState(() => applicationState());

  useEffect(() => {
    let transitionTimer;

    const syncState = () => setState(applicationState());
    const now = Date.now();
    const transitions = [
      new Date(program.applicationOpenAt).getTime(),
      new Date(program.applicationCloseAt).getTime() + 1,
    ];
    const nextTransition = transitions.find((time) => time > now);

    if (nextTransition) {
      transitionTimer = window.setTimeout(
        syncState,
        Math.max(0, nextTransition - now + 50),
      );
    }

    window.addEventListener('focus', syncState);
    document.addEventListener('visibilitychange', syncState);

    return () => {
      window.clearTimeout(transitionTimer);
      window.removeEventListener('focus', syncState);
      document.removeEventListener('visibilitychange', syncState);
    };
  }, [state]);

  return state;
}
