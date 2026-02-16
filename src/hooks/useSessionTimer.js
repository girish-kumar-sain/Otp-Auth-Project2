/**
 * useSessionTimer.js
 *
 * Guarantees:
 *  • Does NOT reset on re-render — interval stored in useRef
 *  • Drift-proof: elapsed = Date.now() - startTime each tick (not a counter)
 *  • setInterval cleared in useEffect cleanup (no memory leaks)
 *  • useMemo recomputes formatted string only when tick changes
 */

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * @param {number} startTime - Unix timestamp (ms) when the session began
 * @returns {{ formatted: string, elapsedMs: number }}
 */
export const useSessionTimer = (startTime) => {
  const [tick, setTick]   = useState(0);
  const intervalRef       = useRef(null);

  useEffect(() => {
    if (!startTime) return;

    intervalRef.current = setInterval(() => setTick(t => t + 1), 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime]);

  const { formatted, elapsedMs } = useMemo(() => {
    if (!startTime) return { formatted: '00:00', elapsedMs: 0 };
    const ms       = Date.now() - startTime;
    const totalSec = Math.floor(ms / 1000);
    const mins     = Math.floor(totalSec / 60);
    const secs     = totalSec % 60;
    const pad      = (n) => String(n).padStart(2, '0');
    return { formatted: `${pad(mins)}:${pad(secs)}`, elapsedMs: ms };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, startTime]);

  return { formatted, elapsedMs };
};
