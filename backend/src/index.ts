import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './lib/env';

const app = new Hono<Env>();

app.use('*', (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  return cors({
    origin: (origin) => (allowed.includes(origin) ? origin : null),
    allowHeaders: ['Authorization', 'Content-Type'],
  })(c, next);
});

app.get('/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) =>
  c.json({ error: { code: 'not_found', message: 'No route matches this path.' } }, 404),
);

export default app;
