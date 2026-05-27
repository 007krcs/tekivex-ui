// ══════════════════════════════════════════════════════════════════════════════
// SOLID BINDING (#13) — Signal factory. Pass Solid's createSignal + onCleanup.
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentOptions } from '../core/Agent';
import { createAgentController, type AgentControllerState } from './vanilla';

export interface SolidAdapter {
  createSignal<T>(initial: T): [() => T, (v: T) => void];
  onCleanup(fn: () => void): void;
}

export function createUseAgentSolid(adapter: SolidAdapter) {
  return function useAgent(opts: AgentOptions) {
    const controller = createAgentController(opts);
    const [state, setState] = adapter.createSignal<AgentControllerState>(
      controller.getState(),
    );
    const unsub = controller.subscribe((s) => setState(s));
    adapter.onCleanup(() => {
      unsub();
      controller.dispose();
    });
    return {
      state,
      send: controller.send,
      stop: controller.stop,
      reset: controller.reset,
    };
  };
}
