import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './lib/env';
import { mosques } from './routes/mosques';
import { incidents } from './routes/incidents';
import { tips } from './routes/tips';
import { me } from './routes/me';
import { geocode } from './routes/geocode';
import { admin } from './routes/admin';
import { media } from './routes/media';

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

app.route('/v1/mosques', mosques);
app.route('/v1/incidents', incidents);
app.route('/v1/tips', tips);
app.route('/v1/me', me);
app.route('/v1/geocode', geocode);
app.route('/v1/admin', admin);
app.route('/v1/media', media);

app.notFound((c) =>
  c.json({ error: { code: 'not_found', message: 'No route matches this path.' } }, 404),
);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: { code: 'internal_error', message: 'Something went wrong.' } }, 500);
});

export default app;
