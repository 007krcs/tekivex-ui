'use client';

// ══════════════════════════════════════════════════════════════════════════════
// useEventCollector (#16) — React hook that yields a stable middleware which
// captures every AgentEvent into state. Plug into `useAgent({ middleware })`.
// ══════════════════════════════════════════════════════════════════════════════

import { useCallback, useMemo, useState } from 'react';
import type { AgentEvent } from '../core/events';
import type { Middleware } from '../core/Middleware';

export interface UseEventCollectorReturn {
  events: AgentEvent[];
  middleware: Middleware;
  clear(): void;
}

export function useEventCollector(): UseEventCollectorReturn {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const middleware = useMemo<Middleware>(
    () => ({
      name: 'devtools-collector',
      onEvent: (evt) => setEvents((prev) => [...prev, evt]),
    }),
    [],
  );
  const clear = useCallback(() => setEvents([]), []);
  return { events, middleware, clear };
}
