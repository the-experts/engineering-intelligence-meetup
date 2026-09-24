import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PaymentClient,
  chargeIdempotencyKey,
  PAYMENT_RETRY_ATTEMPTS,
  PAYMENT_RETRY_BASE_DELAY_MS,
  type ChargeRequest,
} from '../src/clients/payment-client.ts';
import { RetryError, UpstreamError } from '../src/lib/retry.ts';

process.env.PAYMENT_API_KEY = 'test-key';

const request: ChargeRequest = { tenantId: 't1', amountCents: 10, currency: 'EUR', periodId: '2026-08' };

interface Reply {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

function scriptedFetch(replies: Reply[], seen: Headers[]): typeof fetch {
  let call = 0;
  return (async (_url: string | URL | Request, init?: RequestInit) => {
    seen.push(new Headers(init?.headers));
    const reply = replies[Math.min(call++, replies.length - 1)];
    return new Response(JSON.stringify(reply.body ?? {}), {
      status: reply.status,
      headers: { 'content-type': 'application/json', ...(reply.headers ?? {}) },
    });
  }) as typeof fetch;
}

function recordingSleep(delays: number[]) {
  return async (ms: number) => {
    delays.push(ms);
  };
}

const ok: Reply = { status: 200, body: { chargeId: 'ch_1', status: 'succeeded' } };

test('the idempotency key is deterministic from tenant and period (ADR-007)', () => {
  assert.equal(chargeIdempotencyKey(request), 'charge:t1:2026-08');
  const repriced: ChargeRequest = { ...request, amountCents: 999 };
  assert.equal(chargeIdempotencyKey(repriced), 'charge:t1:2026-08');
});

test('every charge attempt sends the same idempotency key', async () => {
  const seen: Headers[] = [];
  const client = new PaymentClient(scriptedFetch([{ status: 503 }, { status: 502 }, ok], seen), 'http://pay', {
    sleep: recordingSleep([]),
  });
  const result = await client.charge(request);
  assert.equal(result.chargeId, 'ch_1');
  assert.equal(seen.length, 3);
  for (const headers of seen) assert.equal(headers.get('idempotency-key'), 'charge:t1:2026-08');
});

test('retries at most three attempts with backoff from two seconds (ADR-012)', async () => {
  const seen: Headers[] = [];
  const delays: number[] = [];
  let retries = 0;
  const client = new PaymentClient(scriptedFetch([{ status: 503 }], seen), 'http://pay', {
    sleep: recordingSleep(delays),
    onRetry: () => retries++,
  });
  await assert.rejects(client.charge(request), (e: unknown) => e instanceof RetryError && e.attempts === 3);
  assert.equal(PAYMENT_RETRY_ATTEMPTS, 3);
  assert.equal(PAYMENT_RETRY_BASE_DELAY_MS, 2000);
  assert.equal(seen.length, 3);
  assert.equal(retries, 2);
  assert.equal(delays.length, 2);
  assert.ok(delays[0] >= 2000 && delays[0] < 2400, `first delay ${delays[0]}`);
  assert.ok(delays[1] >= 4000 && delays[1] < 4800, `second delay ${delays[1]}`);
});

test('honours Retry-After when the provider sends it', async () => {
  const delays: number[] = [];
  const client = new PaymentClient(
    scriptedFetch([{ status: 429, headers: { 'retry-after': '7' } }, ok], []),
    'http://pay',
    { sleep: recordingSleep(delays) },
  );
  await client.charge(request);
  assert.deepEqual(delays, [7000]);
});

test('does not wait out a Retry-After longer than thirty seconds', async () => {
  const seen: Headers[] = [];
  const client = new PaymentClient(
    scriptedFetch([{ status: 429, headers: { 'retry-after': '600' } }], seen),
    'http://pay',
    { sleep: recordingSleep([]) },
  );
  await assert.rejects(client.charge(request), RetryError);
  assert.equal(seen.length, 1);
});

test('does not retry a rejected charge', async () => {
  const seen: Headers[] = [];
  const client = new PaymentClient(scriptedFetch([{ status: 400 }], seen), 'http://pay', { sleep: recordingSleep([]) });
  await assert.rejects(
    client.charge(request),
    (e: unknown) => e instanceof RetryError && e.cause instanceof UpstreamError && e.cause.status === 400,
  );
  assert.equal(seen.length, 1);
});
