// ══════════════════════════════════════════════════════════════════════════════
// VUE BINDING (#13) — Composable factory.
// Pass Vue's reactivity primitives so we don't take a hard dep on vue.
// Usage:
//   import { shallowRef, onScopeDispose } from 'vue';
//   const useAgent = createUseAgentVue({ shallowRef, onScopeDispose });
//   const agent = useAgent({ provider, model });
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentOptions } from '../core/Agent';
import { createAgentController, type AgentControllerState } from './vanilla';

export interface VueRef<T> {
  value: T;
}

export interface VueAdapter {
  shallowRef<T>(value: T): VueRef<T>;
  onScopeDispose(fn: () => void): void;
}

export function createUseAgentVue(adapter: VueAdapter) {
  return function useAgent(opts: AgentOptions) {
    const controller = createAgentController(opts);
    const state = adapter.shallowRef<AgentControllerState>(controller.getState());
    const unsub = controller.subscribe((s) => (state.value = s));
    adapter.onScopeDispose(() => {
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
