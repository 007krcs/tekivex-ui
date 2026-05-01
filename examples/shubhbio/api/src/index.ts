import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { ENV } from './env';
import { registerDraftRoutes } from './routes/draft';
import { registerPaymentRoutes } from './routes/payment';
import { registerDownloadRoutes } from './routes/download';
import { registerTemplateRoutes } from './routes/templates';
import { registerWebhookRoutes } from './routes/webhook';

async function build() {
  const app = Fastify({ logger: true, bodyLimit: 8 * 1024 * 1024 });

  await app.register(cors, {
    origin: ENV.webOrigin,
    credentials: true,
  });
  await app.register(cookie, { secret: ENV.cookieSecret });
  await app.register(multipart, { limits: { fileSize: 6 * 1024 * 1024 } });
  await app.register(rateLimit, { max: 60, timeWindow: '1 minute' });

  app.get('/healthz', () => ({ ok: true, version: '0.1.0' }));

  await registerTemplateRoutes(app);
  await registerDraftRoutes(app);
  await registerPaymentRoutes(app);
  await registerWebhookRoutes(app);
  await registerDownloadRoutes(app);

  return app;
}

build()
  .then((app) => app.listen({ port: ENV.port, host: '0.0.0.0' }))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
