/**
 * Tekivex UI — engine/payment
 *
 * Provider-agnostic payment abstraction. Hosting payment SDKs (Razorpay,
 * Stripe, etc.) inside our bundle is heavy and locks consumers in; instead
 * this engine defines a small interface and loads the provider's hosted
 * checkout script on demand.
 *
 * Built-in adapter: Razorpay (India, supports UPI/cards/wallets at INR 1+).
 * Add more by implementing PaymentProvider.
 *
 * Security note: client code never trusts payment success on its own. Every
 * checkout returns a payload (orderId, paymentId, signature) that the host
 * application MUST forward to its backend for HMAC verification before
 * unlocking any paid resource (e.g., issuing a download token).
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface MoneyAmount {
  /** Smallest currency unit (paise for INR, cents for USD). */
  minor: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | string;
}

export interface PaymentCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CheckoutRequest {
  /** Caller-supplied order id (e.g., from server-issued order). */
  orderId: string;
  amount: MoneyAmount;
  description?: string;
  customer?: PaymentCustomer;
  /** Provider-specific extras (theme color, prefill, notes). */
  extra?: Record<string, unknown>;
}

export interface CheckoutSuccess {
  status: 'success';
  /** Echoed orderId. */
  orderId: string;
  /** Provider's payment id. */
  paymentId: string;
  /** Provider's signature for backend HMAC verification. */
  signature: string;
  /** Raw provider response for debugging. */
  raw: unknown;
}

export interface CheckoutCancelled {
  status: 'cancelled';
  orderId: string;
  reason?: string;
}

export interface CheckoutFailed {
  status: 'failed';
  orderId: string;
  reason: string;
  raw?: unknown;
}

export type CheckoutResult = CheckoutSuccess | CheckoutCancelled | CheckoutFailed;

export interface PaymentProvider {
  readonly id: string;
  /** Lazily ensure the provider SDK is loaded into window. */
  ensureLoaded(): Promise<void>;
  /** Open the provider's checkout. Returns when user completes/cancels/fails. */
  checkout(request: CheckoutRequest): Promise<CheckoutResult>;
}

/* -------------------------------------------------------------------------- */
/* Script loader                                                               */
/* -------------------------------------------------------------------------- */

const loadedScripts = new Map<string, Promise<void>>();

export function loadScript(src: string, integrity?: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('engine/payment: loadScript requires a browser'));
  }
  const existing = loadedScripts.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const already = document.querySelector<HTMLScriptElement>(
      `script[data-tkx-src="${CSS.escape(src)}"]`,
    );
    if (already) {
      if (already.dataset.tkxLoaded === '1') return resolve();
      already.addEventListener('load', () => resolve(), { once: true });
      already.addEventListener(
        'error',
        () => reject(new Error(`engine/payment: failed to load ${src}`)),
        { once: true },
      );
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.dataset.tkxSrc = src;
    if (integrity) {
      el.integrity = integrity;
      el.crossOrigin = 'anonymous';
    }
    el.addEventListener(
      'load',
      () => {
        el.dataset.tkxLoaded = '1';
        resolve();
      },
      { once: true },
    );
    el.addEventListener(
      'error',
      () => {
        loadedScripts.delete(src);
        reject(new Error(`engine/payment: failed to load ${src}`));
      },
      { once: true },
    );
    document.head.appendChild(el);
  });
  loadedScripts.set(src, promise);
  return promise;
}

/* -------------------------------------------------------------------------- */
/* Razorpay adapter                                                            */
/* -------------------------------------------------------------------------- */

export interface RazorpayProviderOptions {
  /** Razorpay key id (publishable). NOT the secret. */
  keyId: string;
  /** UI display name (your app/brand). */
  name: string;
  /** Optional logo URL shown in checkout modal. */
  image?: string;
  /** Theme color hex (e.g., #d97706). */
  themeColor?: string;
  /** Override script URL (pin to a specific version if desired). */
  scriptSrc?: string;
}

interface RazorpayCheckoutInstance {
  open(): void;
  on(event: 'payment.failed', cb: (resp: unknown) => void): void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayCheckoutInstance;
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const RAZORPAY_DEFAULT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export function createRazorpayProvider(
  options: RazorpayProviderOptions,
): PaymentProvider {
  const scriptSrc = options.scriptSrc ?? RAZORPAY_DEFAULT_SRC;
  return {
    id: 'razorpay',
    async ensureLoaded() {
      await loadScript(scriptSrc);
      const w = window as unknown as { Razorpay?: RazorpayConstructor };
      if (typeof w.Razorpay !== 'function') {
        throw new Error('engine/payment: Razorpay global not present after script load');
      }
    },
    async checkout(request) {
      await this.ensureLoaded();
      return new Promise<CheckoutResult>((resolve) => {
        const w = window as unknown as { Razorpay: RazorpayConstructor };
        const config: Record<string, unknown> = {
          key: options.keyId,
          amount: request.amount.minor,
          currency: request.amount.currency,
          name: options.name,
          description: request.description ?? '',
          order_id: request.orderId,
          image: options.image,
          theme: options.themeColor ? { color: options.themeColor } : undefined,
          prefill: request.customer
            ? {
                name: request.customer.name,
                email: request.customer.email,
                contact: request.customer.phone,
              }
            : undefined,
          modal: {
            ondismiss: () =>
              resolve({
                status: 'cancelled',
                orderId: request.orderId,
                reason: 'user-dismissed',
              }),
          },
          handler: (resp: RazorpaySuccessResponse) => {
            resolve({
              status: 'success',
              orderId: resp.razorpay_order_id || request.orderId,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
              raw: resp,
            });
          },
          ...(request.extra ?? {}),
        };

        try {
          const rzp = new w.Razorpay(config);
          rzp.on('payment.failed', (resp: unknown) =>
            resolve({
              status: 'failed',
              orderId: request.orderId,
              reason: 'payment-failed',
              raw: resp,
            }),
          );
          rzp.open();
        } catch (err) {
          resolve({
            status: 'failed',
            orderId: request.orderId,
            reason: err instanceof Error ? err.message : 'unknown-error',
          });
        }
      });
    },
  };
}

/* -------------------------------------------------------------------------- */
/* PaymentEngine — registry + verification helper                              */
/* -------------------------------------------------------------------------- */

export class PaymentEngine {
  private providers = new Map<string, PaymentProvider>();

  register(provider: PaymentProvider): this {
    this.providers.set(provider.id, provider);
    return this;
  }

  get(id: string): PaymentProvider | undefined {
    return this.providers.get(id);
  }

  async checkout(providerId: string, request: CheckoutRequest): Promise<CheckoutResult> {
    const p = this.providers.get(providerId);
    if (!p) {
      return {
        status: 'failed',
        orderId: request.orderId,
        reason: `provider not registered: ${providerId}`,
      };
    }
    return p.checkout(request);
  }
}

/**
 * Razorpay HMAC-SHA256 signature verifier — used by backends written in
 * TypeScript (e.g., the ShubhBio Fastify API). The secret must NEVER be
 * shipped to the browser; this function is purely server-side.
 *
 * Signature payload per Razorpay docs:
 *   `${order_id}|${payment_id}` signed with key_secret using HMAC-SHA256.
 */
export async function verifyRazorpaySignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): Promise<boolean> {
  const subtle = (globalThis as { crypto?: Crypto }).crypto?.subtle;
  if (!subtle) throw new Error('engine/payment: SubtleCrypto unavailable');
  const enc = new TextEncoder();
  const key = await subtle.importKey(
    'raw',
    enc.encode(args.keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await subtle.sign(
    'HMAC',
    key,
    enc.encode(`${args.orderId}|${args.paymentId}`),
  );
  const view = new Uint8Array(sigBuf);
  let hex = '';
  for (let i = 0; i < view.length; i++) hex += view[i].toString(16).padStart(2, '0');
  // Constant-time compare
  if (hex.length !== args.signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) {
    diff |= hex.charCodeAt(i) ^ args.signature.charCodeAt(i);
  }
  return diff === 0;
}
