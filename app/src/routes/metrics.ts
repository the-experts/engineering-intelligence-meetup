import { Router } from 'express';
import type { Metrics } from '../lib/metrics.ts';

export function metricsRoutes(metrics: Metrics): Router {
  const r = Router();
  r.get('/metrics', (_req, res) => {
    res.type('text/plain; version=0.0.4; charset=utf-8').send(metrics.renderPrometheus());
  });
  return r;
}
