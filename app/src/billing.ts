// Billing run: turn usage into a charge for one tenant and period.

import type { UsageClient } from './clients/usage-client.ts';
import type { PaymentClient, ChargeResult } from './clients/payment-client.ts';
import { log } from './lib/logger.ts';
import { Metrics } from './lib/metrics.ts';

const PRICE_CENTS: Record<string, number> = { 'api.calls': 1, 'storage.gb': 20, 'events.ingested': 2 };

export function priceUsage(records: { metric: string; quantity: number }[]): number {
  return records.reduce((sum, r) => sum + (PRICE_CENTS[r.metric] ?? 0) * r.quantity, 0);
}

export class BillingService {
  private readonly usage: UsageClient;
  private readonly payment: PaymentClient;
  private readonly metrics: Metrics;
  constructor(usage: UsageClient, payment: PaymentClient, metrics: Metrics = new Metrics()) {
    this.usage = usage;
    this.payment = payment;
    this.metrics = metrics;
  }

  async runFor(tenantId: string, periodId: string): Promise<ChargeResult> {
    try {
      const records = await this.usage.fetchUsage(tenantId);
      const amountCents = priceUsage(records);
      log('info', 'billing run', { tenantId, periodId, amountCents, records: records.length });
      const result = await this.payment.charge({ tenantId, amountCents, currency: 'EUR', periodId });
      this.metrics.recordBillingRun(result.status === 'failed' ? 'failed' : 'succeeded');
      return result;
    } catch (err) {
      this.metrics.recordBillingRun('failed');
      throw err;
    }
  }
}
