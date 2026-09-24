import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withRetry, RetryError, UpstreamError, parseRetryAfter } from '../src/lib/retry.ts';

const noSleep = async () => {};

test('withRetry returns on first success', async () => {
  const v = await withRetry(async () => 42, { sleep: noSleep });
  assert.equal(v, 42);
});

test('withRetry retries transient errors then succeeds', async () => {
  let calls = 0;
  const v = await withRetry(async () => {
    calls++;
    if (calls < 3) throw new UpstreamError(503, 'busy');
    return 'ok';
  }, { sleep: noSleep });
  assert.equal(v, 'ok');
  assert.equal(calls, 3);
});

test('withRetry does not retry non-retryable errors', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(async () => { calls++; throw new UpstreamError(400, 'bad'); }, { sleep: noSleep }),
    (e: unknown) => e instanceof RetryError && e.attempts === 3,
  );
  assert.equal(calls, 1);
});

test('withRetry waits at least as long as a Retry-After asks', async () => {
  const delays: number[] = [];
  let calls = 0;
  await withRetry(async () => {
    if (++calls === 1) throw new UpstreamError(429, 'slow down', 5000);
    return 'ok';
  }, { baseDelayMs: 100, sleep: async (ms) => { delays.push(ms); } });
  assert.deepEqual(delays, [5000]);
});

test('parseRetryAfter reads seconds and HTTP dates', () => {
  const now = Date.parse('2026-09-24T12:00:00Z');
  assert.equal(parseRetryAfter(null), undefined);
  assert.equal(parseRetryAfter('3'), 3000);
  assert.equal(parseRetryAfter('Thu, 24 Sep 2026 12:00:10 GMT', now), 10000);
  assert.equal(parseRetryAfter('Thu, 24 Sep 2026 11:59:00 GMT', now), 0);
  assert.equal(parseRetryAfter('soon'), undefined);
});
