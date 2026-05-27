// ══════════════════════════════════════════════════════════════════════════════
// SVELTE BINDING (#13) — Returns a Svelte readable-store-compatible object.
// Usage:
//   const agent = createAgentStore({ provider, model });
//   // in component: $agent → AgentControllerState
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentOptions } from '../core/Agent';
import { createAgentController, type AgentControllerState } from './vanilla';

export interface SvelteAgentStore {
  subscribe(run: (state: AgentControllerState) => void): () => void;
  send(text: string): Promise<void>;
  stop(): void;
  reset(): void;
  dispose(): void;
}

export function createAgentStore(opts: AgentOptions): SvelteAgentStore {
  const controller = createAgentController(opts);
  const subscribers = new Set<(s: AgentControllerState) => void>();
  controller.subscribe((s) => {
    for (const sub of subscribers) sub(s);
  });
  return {
    subscribe(run) {
      run(controller.getState());
      subscribers.add(run);
      return () => subscribers.delete(run);
    },
    send: controller.send,
    stop: controller.stop,
    reset: controller.reset,
    dispose: controller.dispose,
  };
}
