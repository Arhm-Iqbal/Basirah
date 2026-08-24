import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export function fail(
  c: Context,
  status: ContentfulStatusCode,
  code: string,
  message: string,
  details?: unknown,
) {
  return c.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    status,
  );
}

export function zodFail(c: Context, issues: unknown) {
  return fail(
    c,
    422,
    'validation_failed',
    'The request body did not match the expected shape.',
    issues,
  );
}
