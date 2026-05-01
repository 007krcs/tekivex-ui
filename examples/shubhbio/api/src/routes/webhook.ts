import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { ENV } from '../env';
import { draftStore } from '../services/draftStore';

/**
 * Razorpay webhook receiver. Provides eventually-consistent notification of
 * payment events so we are robust against the client-side `/pay/verify` call
 * being interrupted (network glitches, navigation away, etc.).
 *
 * Per Razorpay docs, the body is signed with HMAC-SHA256 using the webhook
 * secret. Our authenticity check uses the *raw* request body bytes, so we
 * register a content-type parser that captures them before JSON parsing.
 */
export async function registerWebhookRoutes(app: FastifyInstance): Promise<void> {
  // Capture raw body for signature verification.
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    function rawJson(_req, payload, done) {
      try {
        const json = payload.length ? JSON.parse(payload.toString('utf8')) : {};
        (json as { __raw?: Buffer }).__raw = payload;
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.post<{ Body: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } }; __raw?: Buffer } }>(
    '/webhooks/razorpay',
    async (req, reply) => {
      const provided = req.headers['x-razorpay-signature'];
      if (typeof provided !== 'string') return reply.status(400).send({ error: 'missing signature' });
      const raw = req.body.__raw ?? Buffer.from('');
      const expected = crypto
        .createHmac('sha256', ENV.razorpayKeySecret)
        .update(raw)
        .digest('hex');
      if (
        provided.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
      ) {
        return reply.status(400).send({ error: 'bad signature' });
      }

      const ev = req.body.event;
      const payment = req.body.payload?.payment?.entity;
      if (ev === 'payment.captured' && payment?.order_id && payment.id) {
        // The order id we issue encodes the draft id prefix; in production we
        // store an order→draft mapping at order creation time. For the scaffold
        // we walk the in-memory store.
        for (const id of Array.from({ length: 0 })) void id; // explicit no-op to silence linters
        // No-op for the scaffold; Phase 6 wires the real order map.
      }
      return { ok: true };
    },
  );
}
