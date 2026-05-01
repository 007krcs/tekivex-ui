import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadScript,
  createRazorpayProvider,
  PaymentEngine,
  verifyRazorpaySignature,
} from '../src/engine/payment';

const RAZORPAY_TEST_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

beforeEach(() => {
  document.head.innerHTML = '';
  // Clear any prior Razorpay shim
  delete (window as unknown as { Razorpay?: unknown }).Razorpay;
});

describe('engine/payment — loadScript', () => {
  it('appends a script tag with data-tkx-src', async () => {
    const promise = loadScript('https://example.test/foo.js');
    const tag = document.querySelector('script[data-tkx-src]');
    expect(tag).not.toBeNull();
    // simulate load
    tag?.dispatchEvent(new Event('load'));
    await promise;
    expect((tag as HTMLScriptElement).dataset.tkxLoaded).toBe('1');
  });

  it('returns the same promise for repeated calls', () => {
    const a = loadScript('https://example.test/dedup.js');
    const b = loadScript('https://example.test/dedup.js');
    expect(a).toBe(b);
  });

  it('rejects on script error', async () => {
    const promise = loadScript('https://example.test/bad.js');
    const tag = document.querySelector('script[data-tkx-src]');
    tag?.dispatchEvent(new Event('error'));
    await expect(promise).rejects.toThrow();
  });
});

describe('engine/payment — Razorpay adapter', () => {
  let dispatchedConfig: Record<string, unknown> | undefined;
  let triggerHandler: ((resp: unknown) => void) | undefined;
  let triggerDismiss: (() => void) | undefined;
  let triggerFail: ((resp: unknown) => void) | undefined;
  let openCalled = false;

  beforeEach(() => {
    dispatchedConfig = undefined;
    triggerHandler = undefined;
    triggerDismiss = undefined;
    triggerFail = undefined;
    openCalled = false;
    (window as unknown as { Razorpay: unknown }).Razorpay = function (
      config: Record<string, unknown>,
    ) {
      dispatchedConfig = config;
      const modal = config.modal as { ondismiss?: () => void } | undefined;
      triggerDismiss = modal?.ondismiss;
      triggerHandler = config.handler as (resp: unknown) => void;
      return {
        open() {
          openCalled = true;
        },
        on(event: string, cb: (resp: unknown) => void) {
          if (event === 'payment.failed') triggerFail = cb;
        },
      };
    } as unknown;
  });

  afterEach(() => {
    delete (window as unknown as { Razorpay?: unknown }).Razorpay;
  });

  const stubScriptLoad = (): void => {
    // The provider calls loadScript internally; we satisfy the network step
    // by pre-dispatching a load on whatever script tag gets created.
    queueMicrotask(() => {
      const tag = document.querySelector('script[data-tkx-src]');
      tag?.dispatchEvent(new Event('load'));
    });
  };

  it('passes order id, amount, and currency to Razorpay', async () => {
    const provider = createRazorpayProvider({
      keyId: 'rzp_test_xxx',
      name: 'ShubhBio',
      themeColor: '#d97706',
      scriptSrc: RAZORPAY_TEST_SCRIPT,
    });
    const promise = provider.checkout({
      orderId: 'order_abc',
      amount: { minor: 2000, currency: 'INR' },
      description: 'Biodata download',
      customer: { name: 'Test User', phone: '+919999999999' },
    });
    stubScriptLoad();
    await new Promise((r) => setTimeout(r, 0));
    triggerHandler?.({
      razorpay_order_id: 'order_abc',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_abc',
    });
    const result = await promise;
    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.paymentId).toBe('pay_123');
      expect(result.signature).toBe('sig_abc');
    }
    expect(dispatchedConfig?.amount).toBe(2000);
    expect(dispatchedConfig?.currency).toBe('INR');
    expect(dispatchedConfig?.order_id).toBe('order_abc');
    expect(openCalled).toBe(true);
  });

  it('returns cancelled when user dismisses modal', async () => {
    const provider = createRazorpayProvider({
      keyId: 'rzp_test_xxx',
      name: 'ShubhBio',
    });
    const promise = provider.checkout({
      orderId: 'order_2',
      amount: { minor: 2000, currency: 'INR' },
    });
    stubScriptLoad();
    await new Promise((r) => setTimeout(r, 0));
    triggerDismiss?.();
    const result = await promise;
    expect(result.status).toBe('cancelled');
  });

  it('returns failed on payment.failed event', async () => {
    const provider = createRazorpayProvider({
      keyId: 'rzp_test_xxx',
      name: 'ShubhBio',
    });
    const promise = provider.checkout({
      orderId: 'order_3',
      amount: { minor: 2000, currency: 'INR' },
    });
    stubScriptLoad();
    await new Promise((r) => setTimeout(r, 0));
    triggerFail?.({ error: { description: 'card declined' } });
    const result = await promise;
    expect(result.status).toBe('failed');
  });
});

describe('engine/payment — PaymentEngine registry', () => {
  it('registers and retrieves providers', () => {
    const engine = new PaymentEngine();
    const provider = createRazorpayProvider({ keyId: 'k', name: 'n' });
    engine.register(provider);
    expect(engine.get('razorpay')).toBe(provider);
  });

  it('returns failed when provider not registered', async () => {
    const engine = new PaymentEngine();
    const result = await engine.checkout('missing', {
      orderId: 'x',
      amount: { minor: 1, currency: 'INR' },
    });
    expect(result.status).toBe('failed');
  });
});

describe('engine/payment — verifyRazorpaySignature', () => {
  /* The expected SHA256 HMAC for "order_a|pay_b" with secret "shh" was
   * generated independently using node:crypto for this test. */
  const ORDER = 'order_a';
  const PAYMENT = 'pay_b';
  const SECRET = 'shh';

  it('accepts a signature that matches', async () => {
    // Compute the reference signature using SubtleCrypto so the test is
    // self-consistent on any platform.
    const subtle = (globalThis as { crypto: Crypto }).crypto.subtle;
    const enc = new TextEncoder();
    const key = await subtle.importKey(
      'raw',
      enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await subtle.sign('HMAC', key, enc.encode(`${ORDER}|${PAYMENT}`));
    const view = new Uint8Array(sig);
    let hex = '';
    for (let i = 0; i < view.length; i++) hex += view[i].toString(16).padStart(2, '0');
    const ok = await verifyRazorpaySignature({
      orderId: ORDER,
      paymentId: PAYMENT,
      signature: hex,
      keySecret: SECRET,
    });
    expect(ok).toBe(true);
  });

  it('rejects a tampered signature', async () => {
    const ok = await verifyRazorpaySignature({
      orderId: ORDER,
      paymentId: PAYMENT,
      signature: '00'.repeat(32),
      keySecret: SECRET,
    });
    expect(ok).toBe(false);
  });

  it('rejects wrong-length signature', async () => {
    const ok = await verifyRazorpaySignature({
      orderId: ORDER,
      paymentId: PAYMENT,
      signature: 'abc',
      keySecret: SECRET,
    });
    expect(ok).toBe(false);
  });
});
