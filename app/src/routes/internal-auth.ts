import { createHash, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { getSecret } from '../lib/secrets.ts';
import { log } from '../lib/logger.ts';

// Platform policy (September 2026): operational endpoints live under /internal/
// and require X-Internal-Token, validated against getSecret('INTERNAL_TOKEN').

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function requireInternalToken(): RequestHandler {
  return (req, res, next) => {
    let expected: string;
    try {
      expected = getSecret('INTERNAL_TOKEN');
    } catch (err) {
      log('error', 'internal token not configured', { secret: 'INTERNAL_TOKEN', err: String(err) });
      res.status(503).json({ error: 'internal endpoints unavailable' });
      return;
    }
    const presented = req.get('x-internal-token');
    if (presented === undefined || !timingSafeEqual(digest(presented), digest(expected))) {
      res.status(401).json({ error: 'unauthorised' });
      return;
    }
    next();
  };
}
