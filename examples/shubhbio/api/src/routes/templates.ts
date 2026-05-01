import type { FastifyInstance } from 'fastify';
import { ALL_TEMPLATES } from '@shubhbio/templates';

export async function registerTemplateRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { audience?: string } }>('/templates', async (req) => {
    const audience = req.query.audience;
    const list = ALL_TEMPLATES.filter((t) =>
      audience ? t.audience === audience || t.audience === 'all' : true,
    );
    return list.map((t) => ({ id: t.id, label: t.label, audience: t.audience }));
  });
}
