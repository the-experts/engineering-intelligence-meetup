// Payment provider client. Charges a tenant for a billing period.
// Retries follow ADR-012 and are only safe because of the idempotency key (ADR-007).

import { config } from '../config.ts';
import { httpJson } from '../lib/http.ts';
import { getSecret } from '../lib/secrets.ts';
import { withRetry, isTransientHttpError, UpstreamError } from '../lib/retry.ts';
import { log } from '../lib/logger.ts';

export interface ChargeRequest {
  tenantId: string;
  amountCents: number;
  currency: 'EUR' | 'USD';
  periodId: string;
}

export interface ChargeResult {
  chargeId: string;
  status: 'succeeded' | 'pending' | 'failed';
}

// ADR-012: at most three attempts, exponential backoff from two seconds.
export const PAYMENT_RETRY_ATTEMPTS = 3;
export const PAYMENT_RETRY_BASE_DELAY_MS = 2000;
export const PAYMENT_RETRY_MAX_DELAY_MS = 8000;
// A provider asking us to wait longer than this is left to the next run (ADR-012).
export const PAYMENT_MAX_RETRY_AFTER_MS = 30_000;

export interface PaymentClientOptions {
  onRetry?: () => void;
  sleep?: (ms: number) => Promise<void>;
}

export function chargeIdempotencyKey(req: Pick<ChargeRequest, 'tenantId' | 'periodId'>): string {
  return `charge:${req.tenantId}:${req.periodId}`;
}

function isRetryableCharge(err: unknown): boolean {
  if (err instanceof UpstreamError && err.retryAfterMs !== undefined && err.retryAfterMs > PAYMENT_MAX_RETRY_AFTER_MS) {
    return false;
  }
  return isTransientHttpError(err);
}

export class PaymentClient {
  private readonly fetchImpl?: typeof fetch;
  private readonly baseUrl: string;
  private readonly options: PaymentClientOptions;
  constructor(fetchImpl?: typeof fetch, baseUrl: string = config.paymentBaseUrl, options: PaymentClientOptions = {}) {
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl;
    this.options = options;
  }

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    const idempotencyKey = chargeIdempotencyKey(req);
    return withRetry(
      () =>
        httpJson<ChargeResult>(`${this.baseUrl}/v1/charges`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${getSecret('PAYMENT_API_KEY')}`,
            'idempotency-key': idempotencyKey,
          },
          body: req,
          fetchImpl: this.fetchImpl,
        }),
      {
        attempts: PAYMENT_RETRY_ATTEMPTS,
        baseDelayMs: PAYMENT_RETRY_BASE_DELAY_MS,
        maxDelayMs: PAYMENT_RETRY_MAX_DELAY_MS,
        isRetryable: isRetryableCharge,
        sleep: this.options.sleep,
        onRetry: (attempt, err) => {
          this.options.onRetry?.();
          log('warn', 'payment charge retry', {
            tenantId: req.tenantId,
            periodId: req.periodId,
            attempt,
            status: err instanceof UpstreamError ? err.status : undefined,
          });
        },
      },
    );
  }
}
