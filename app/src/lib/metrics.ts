// Service counters rendered in the Prometheus text exposition format (ADR-008).
// Labels stay low-cardinality: never put tenant ids or period ids in them.

export type BillingRunStatus = 'succeeded' | 'failed';

export class Metrics {
  private readonly billingRuns: Record<BillingRunStatus, number> = { succeeded: 0, failed: 0 };
  private paymentRetries = 0;

  recordBillingRun(status: BillingRunStatus): void {
    this.billingRuns[status] += 1;
  }

  recordPaymentRetry(): void {
    this.paymentRetries += 1;
  }

  renderPrometheus(): string {
    return [
      '# HELP billing_runs_total Billing runs by outcome.',
      '# TYPE billing_runs_total counter',
      `billing_runs_total{status="succeeded"} ${this.billingRuns.succeeded}`,
      `billing_runs_total{status="failed"} ${this.billingRuns.failed}`,
      '# HELP payment_retries_total Payment provider charge calls that were retried.',
      '# TYPE payment_retries_total counter',
      `payment_retries_total ${this.paymentRetries}`,
      '',
    ].join('\n');
  }
}
