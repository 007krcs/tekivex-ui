/**
 * Environment configuration. Vite exposes anything prefixed with VITE_ to the
 * client; everything else stays on the server.
 */

const env = (key: string, fallback = ''): string =>
  (import.meta.env as Record<string, string | undefined>)[key] ?? fallback;

export const ENV = {
  apiBase: env('VITE_API_URL', '/api'),
  razorpayKeyId: env('VITE_RAZORPAY_KEY_ID', 'rzp_test_PLACEHOLDER'),
  pricePaise: Number(env('VITE_PRICE_PAISE', '2000')), // ₹20 default
  brand: env('VITE_BRAND_NAME', 'ShubhBio'),
};
