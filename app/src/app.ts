import express from 'express';
import { config } from './config.ts';
import { UsageClient } from './clients/usage-client.ts';
import { PaymentClient, type PaymentClientOptions } from './clients/payment-client.ts';
import { BillingService } from './billing.ts';
import { Metrics } from './lib/metrics.ts';
import { billingRoutes } from './routes/billing.ts';
import { healthRoutes } from './routes/health.ts';
import { metricsRoutes } from './routes/metrics.ts';
import { requireInternalToken } from './routes/internal-auth.ts';

export interface AppDeps {
  fetchImpl?: typeof fetch;
  metrics?: Metrics;
  sleep?: PaymentClientOptions['sleep'];
}

export function createApp(deps: AppDeps = {}) {
  const metrics = deps.metrics ?? new Metrics();
  const usage = new UsageClient(deps.fetchImpl, config.usageBaseUrl);
  const payment = new PaymentClient(deps.fetchImpl, config.paymentBaseUrl, {
    onRetry: () => metrics.recordPaymentRetry(),
    sleep: deps.sleep,
  });
  const billing = new BillingService(usage, payment, metrics);

  const app = express();
  app.use(express.json());
  app.use(healthRoutes());
  app.use('/internal', requireInternalToken(), metricsRoutes(metrics));
  app.use('/billing', billingRoutes(billing));
  return app;
}
