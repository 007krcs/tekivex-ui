// ─────────────────────────────────────────────────────────────────────────────
// #13 · Vue / Svelte / Solid bindings
// All wrap the same vanilla controller.
// ─────────────────────────────────────────────────────────────────────────────

import { AnthropicProvider, createAgentController } from 'tekivex-ui/agent';

const opts = {
  provider: new AnthropicProvider({ endpoint: '/api/agent' }),
  model: 'claude-opus-4-7',
};

// ── Vanilla (any framework or plain JS) ─────────────────────────────────────
const controller = createAgentController(opts);
controller.subscribe((state) => {
  document.querySelector('#out')!.textContent = state.streamingText;
});
await controller.send('Hello');

// ── Vue 3 ───────────────────────────────────────────────────────────────────
// Inside a <script setup> block:
//
//   import { shallowRef, onScopeDispose } from 'vue';
//   import { createUseAgentVue } from 'tekivex-ui/agent';
//   const useAgent = createUseAgentVue({ shallowRef, onScopeDispose });
//   const { state, send } = useAgent(opts);
//   // template: {{ state.streamingText }}

// ── Svelte ──────────────────────────────────────────────────────────────────
// In a .svelte file:
//
//   <script lang="ts">
//     import { createAgentStore } from 'tekivex-ui/agent';
//     const agent = createAgentStore(opts);
//     onDestroy(() => agent.dispose());
//   </script>
//   <div>{$agent.streamingText}</div>
//   <button on:click={() => agent.send('hi')}>send</button>

// ── Solid ───────────────────────────────────────────────────────────────────
// In a Solid component:
//
//   import { createSignal, onCleanup } from 'solid-js';
//   import { createUseAgentSolid } from 'tekivex-ui/agent';
//   const useAgent = createUseAgentSolid({ createSignal, onCleanup });
//   const { state, send } = useAgent(opts);
//   // <div>{state().streamingText}</div>
