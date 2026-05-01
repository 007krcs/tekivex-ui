'use client';

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {
  PaymentEngine,
  type CheckoutRequest,
  type CheckoutResult,
  type PaymentProvider,
} from '../engine/payment';

interface TkxPaymentContextValue {
  engine: PaymentEngine;
  checkout: (providerId: string, request: CheckoutRequest) => Promise<CheckoutResult>;
}

const TkxPaymentContext = createContext<TkxPaymentContextValue | null>(null);

export interface TkxPaymentProviderProps {
  /** PaymentProvider instances to register on mount. New providers added at
   *  runtime should call engine.register from a useEffect. */
  providers: ReadonlyArray<PaymentProvider>;
  children: ReactNode;
}

/**
 * Wraps the app with a single PaymentEngine that has the configured payment
 * providers registered. Components inside use useTkxPayment() to dispatch
 * checkouts. Loading the underlying SDK script happens lazily on the first
 * checkout call so unused providers don't add to the page weight.
 */
export function TkxPaymentProvider({ providers, children }: TkxPaymentProviderProps) {
  const engineRef = useRef<PaymentEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new PaymentEngine();
    for (const p of providers) engineRef.current.register(p);
  }
  const value = useMemo<TkxPaymentContextValue>(() => {
    const engine = engineRef.current!;
    return {
      engine,
      checkout: (providerId, request) => engine.checkout(providerId, request),
    };
  }, []);
  return <TkxPaymentContext.Provider value={value}>{children}</TkxPaymentContext.Provider>;
}

TkxPaymentProvider.displayName = 'TkxPaymentProvider';

export function useTkxPayment(): TkxPaymentContextValue {
  const ctx = useContext(TkxPaymentContext);
  if (!ctx) {
    throw new Error(
      'useTkxPayment: must be used inside <TkxPaymentProvider>. Did you forget to wrap your app?',
    );
  }
  return ctx;
}
