/**
 * Server environment. Required keys throw at boot if missing so deploys fail
 * loudly rather than serving with placeholders.
 */

function need(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`@shubhbio/api: required env var ${name} is missing`);
  }
  return v;
}

export const ENV = {
  port: Number(process.env.PORT ?? 3001),
  cookieSecret: need('COOKIE_SECRET', 'dev-cookie-secret-change-me'),
  tokenSecret: need('TOKEN_SECRET', 'dev-token-secret-change-me'),
  razorpayKeyId: need('RAZORPAY_KEY_ID', 'rzp_test_PLACEHOLDER'),
  razorpayKeySecret: need('RAZORPAY_KEY_SECRET', 'dev-secret'),
  pricePaise: Number(process.env.PRICE_PAISE ?? 2000),
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  draftTtlSeconds: Number(process.env.DRAFT_TTL_SECONDS ?? 7 * 24 * 60 * 60),
  downloadTokenTtlSeconds: Number(process.env.DOWNLOAD_TOKEN_TTL_SECONDS ?? 24 * 60 * 60),
};
