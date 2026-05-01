import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ENV } from '../env';
import { draftStore } from '../services/draftStore';
import { issueDownloadToken } from '../services/tokenIssuer';
import { verifyRazorpaySignature } from 'tekivex-ui/biodata';

const COOKIE_NAME = 'sb_draft';

function ownsDraft(req: FastifyRequest, draftId: string): boolean {
  return req.cookies[COOKIE_NAME] === draftId;
}

export async function registerPaymentRoutes(app: FastifyInstance): Promise<void> {
  /**
   * Create a Razorpay order. Phase 6 calls Razorpay's REST API server-side
   * (using the keySecret) — the scaffold returns a synthetic order id so the
   * web app's flow can be exercised end-to-end against a stub.
   */
  app.post<{ Params: { id: string } }>('/pay/:id/order', async (req, reply) => {
    if (!ownsDraft(req, req.params.id)) return reply.status(403).send({ error: 'forbidden' });
    const draft = draftStore.get(req.params.id);
    if (!draft) return reply.status(404).send({ error: 'not found' });
    if (draft.paid) return reply.status(409).send({ error: 'already paid' });

    // Phase 6 → fetch('https://api.razorpay.com/v1/orders', { auth: keyId:keySecret, ... })
    return {
      orderId: `order_dev_${draft.draftId.slice(0, 12)}`,
      amount: ENV.pricePaise,
      currency: 'INR',
    };
  });

  /**
   * Verify the success payload returned by Razorpay's checkout. Uses
   * verifyRazorpaySignature from tekivex-ui/biodata for constant-time
   * HMAC comparison, then issues a single-use signed download token.
   */
  app.post<{
    Body: { draftId: string; orderId: string; paymentId: string; signature: string };
  }>('/pay/verify', async (req, reply) => {
    const body = req.body;
    if (!body || !ownsDraft(req, body.draftId))
      return reply.status(403).send({ error: 'forbidden' });

    const draft = draftStore.get(body.draftId);
    if (!draft) return reply.status(404).send({ error: 'not found' });

    const ok = await verifyRazorpaySignature({
      orderId: body.orderId,
      paymentId: body.paymentId,
      signature: body.signature,
      keySecret: ENV.razorpayKeySecret,
    });
    if (!ok) return reply.status(400).send({ error: 'signature mismatch' });

    draftStore.patch(body.draftId, { paid: true, paymentId: body.paymentId });
    const token = issueDownloadToken(body.draftId);
    return { downloadUrl: `/api/download/${token}` };
  });
}
