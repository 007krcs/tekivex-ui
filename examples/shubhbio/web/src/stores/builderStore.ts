/**
 * Builder store — holds the draft biodata as the user fills the wizard. Phase
 * 3 wires this up to autosave through api.saveDraft on each step boundary.
 *
 * Persistence: a copy is mirrored into localStorage so a refresh-while-typing
 * doesn't lose data. The server-side draft is the source of truth for paid
 * downloads.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Biodata, Religion } from '@shubhbio/schemas';

interface BuilderState {
  draftId: string | null;
  templateId: string | null;
  religion: Religion | null;
  biodata: Partial<Biodata>;
  step: number;
  /** Bumped after a successful payment so the preview can swap out of the
   *  watermarked / locked mode. */
  paid: boolean;
}

interface BuilderActions {
  setDraft: (input: { draftId: string; templateId: string; religion: Religion }) => void;
  patchBiodata: (patch: Partial<Biodata>) => void;
  setStep: (step: number) => void;
  markPaid: () => void;
  reset: () => void;
}

const INITIAL: BuilderState = {
  draftId: null,
  templateId: null,
  religion: null,
  biodata: {},
  step: 0,
  paid: false,
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set) => ({
      ...INITIAL,
      setDraft: ({ draftId, templateId, religion }) =>
        set({ draftId, templateId, religion, biodata: { religion } }),
      patchBiodata: (patch) =>
        set((s) => ({ biodata: { ...s.biodata, ...patch } as Partial<Biodata> })),
      setStep: (step) => set({ step }),
      markPaid: () => set({ paid: true }),
      reset: () => set(INITIAL),
    }),
    {
      name: 'shubhbio.builder',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draftId: state.draftId,
        templateId: state.templateId,
        religion: state.religion,
        biodata: state.biodata,
        step: state.step,
        paid: state.paid,
      }),
    },
  ),
);
