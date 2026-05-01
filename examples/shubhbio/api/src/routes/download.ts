import type { FastifyInstance } from 'fastify';
import { draftStore } from '../services/draftStore';
import { verifyAndConsumeToken } from '../services/tokenIssuer';

export async function registerDownloadRoutes(app: FastifyInstance): Promise<void> {
  /**
   * Single-use signed download endpoint. Phase 5 server-side renders the PDF
   * using engine/pdf and streams it back. The scaffold returns a JSON
   * placeholder so the wiring can be tested end-to-end.
   */
  app.get<{ Params: { token: string } }>('/download/:token', async (req, reply) => {
    const verified = verifyAndConsumeToken(req.params.token);
    if (!verified) return reply.status(410).send({ error: 'token invalid or expired' });
    const draft = draftStore.get(verified.payload.draftId);
    if (!draft) return reply.status(404).send({ error: 'draft missing' });

    // Phase 5 — server-side render via tekivex-ui/biodata's sceneToPdfBytes
    // and stream as application/pdf with the right Content-Disposition.
    reply.header('Content-Type', 'application/json');
    reply.header(
      'Content-Disposition',
      `attachment; filename="biodata_${draft.draftId.slice(0, 8)}.json"`,
    );
    return {
      placeholder: true,
      draftId: draft.draftId,
      templateId: draft.templateId,
      issuedAt: verified.payload.iat,
      expiresAt: verified.payload.exp,
    };
  });
}
