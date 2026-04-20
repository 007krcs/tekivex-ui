'use client';

import { useState, useCallback } from 'react';

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Manages boolean open/close state for modals, drawers, popovers, dropdowns, etc.
 *
 * @example
 * const { isOpen, open, close, toggle } = useDisclosure();
 * return (
 *   <>
 *     <button onClick={open}>Open</button>
 *     {isOpen && <MyModal onClose={close} />}
 *   </>
 * );
 */
export function useDisclosure(initialState = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);
  return { isOpen, open, close, toggle };
}