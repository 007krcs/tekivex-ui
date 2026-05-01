import type { FastifyInstance, FastifyRequest } from 'fastify';
import { draftStore, newDraftId, DRAFT_TTL_MS } from '../services/draftStore';
import { RELIGIONS, type Religion } from '@shubhbio/schemas';

const COOKIE_NAME = 'sb_draft';

function ownsDraft(req: FastifyRequest, draftId: string): boolean {
  const cookie = req.cookies[COOKIE_NAME];
  return cookie === draftId;
}

export async function registerDraftRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: { religion: string; templateId: string } }>('/draft', async (req, reply) => {
    const { religion, templateId } = req.body ?? {};
    if (!(RELIGIONS as ReadonlyArray<string>).includes(religion))
      return reply.status(400).send({ error: 'invalid religion' });
    if (typeof templateId !== 'string' || templateId.length > 64)
      return reply.status(400).send({ error: 'invalid templateId' });

    const draftId = newDraftId();
    const now = Date.now();
    draftStore.put({
      draftId,
      templateId,
      payload: JSON.stringify({ religion: religion as Religion }),
      createdAt: now,
      updatedAt: now,
      expiresAt: now + DRAFT_TTL_MS,
      paid: false,
    });
    reply
      .setCookie(COOKIE_NAME, draftId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        signed: false,
        maxAge: Math.floor(DRAFT_TTL_MS / 1000),
        path: '/',
      })
      .send({ draftId });
  });

  app.put<{
    Params: { id: string };
    Body: Record<string, unknown>;
  }>('/draft/:id', async (req, reply) => {
    if (!ownsDraft(req, req.params.id)) return reply.status(403).send({ error: 'forbidden' });
    const cur = draftStore.get(req.params.id);
    if (!cur) return reply.status(404).send({ error: 'not found' });
    if (cur.paid) return reply.status(409).send({ error: 'paid drafts are immutable' });
    // Phase 3 will run the religion-specific Zod schema before persistence.
    draftStore.patch(req.params.id, { payload: JSON.stringify(req.body ?? {}) });
    return { ok: true };
  });

  app.get<{ Params: { id: string } }>('/draft/:id', async (req, reply) => {
    if (!ownsDraft(req, req.params.id)) return reply.status(403).send({ error: 'forbidden' });
    const cur = draftStore.get(req.params.id);
    if (!cur) return reply.status(404).send({ error: 'not found' });
    return {
      draftId: cur.draftId,
      templateId: cur.templateId,
      biodata: JSON.parse(cur.payload) as Record<string, unknown>,
      paid: cur.paid,
    };
  });
}
