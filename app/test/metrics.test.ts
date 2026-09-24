import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';
import { Metrics } from '../src/lib/metrics.ts';
import { clearSecretCache } from '../src/lib/secrets.ts';

process.env.PAYMENT_API_KEY = 'test-key';
process.env.INTERNAL_TOKEN = 'test-internal-token';

const internalHeaders = { 'x-internal-token': 'test-internal-token' };

test('renders counters in Prometheus text format (ADR-008)', () => {
  const metrics = new Metrics();
  metrics.recordBillingRun('succeeded');
  metrics.recordBillingRun('failed');
  metrics.recordBillingRun('failed');
  metrics.recordPaymentRetry();
  const text = metrics.renderPrometheus();
  assert.match(text, /^# TYPE billing_runs_total counter$/m);
  assert.match(text, /^billing_runs_total\{status="succeeded"\} 1$/m);
  assert.match(text, /^billing_runs_total\{status="failed"\} 2$/m);
  assert.match(text, /^# TYPE payment_retries_total counter$/m);
  assert.match(text, /^payment_retries_total 1$/m);
  assert.ok(text.endsWith('\n'));
});

function fakeProvider(chargeStatuses: number[]): typeof fetch {
  let charges = 0;
  return (async (url: string | URL | Request) => {
    if (String(url).includes('/usage')) {
      return Response.json([{ tenantId: 't1', metric: 'api.calls', quantity: 10, periodStart: '', periodEnd: '' }]);
    }
    const status = chargeStatuses[Math.min(charges++, chargeStatuses.length - 1)];
    return Response.json({ chargeId: 'ch_1', status: 'succeeded' }, { status });
  }) as typeof fetch;
}

async function withServer(app: ReturnType<typeof createApp>, fn: (base: string) => Promise<void>) {
  const server = app.listen(0);
  const port = (server.address() as { port: number }).port;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

function startRun(base: string, tenantId: string) {
  return fetch(`${base}/billing/runs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tenantId, periodId: '2026-08' }),
  });
}

test('GET /internal/metrics counts billing runs and payment retries without tenant ids', async () => {
  const app = createApp({ fetchImpl: fakeProvider([503, 200, 400]), sleep: async () => {} });
  await withServer(app, async (base) => {
    assert.equal((await startRun(base, 't1')).status, 202);
    assert.equal((await startRun(base, 't2')).status, 502);

    const res = await fetch(`${base}/internal/metrics`, { headers: internalHeaders });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /^text\/plain/);
    const text = await res.text();
    assert.match(text, /^billing_runs_total\{status="succeeded"\} 1$/m);
    assert.match(text, /^billing_runs_total\{status="failed"\} 1$/m);
    assert.match(text, /^payment_retries_total 1$/m);
    assert.doesNotMatch(text, /t1|t2|tenant/);
  });
});

test('a charge the provider reports as failed counts as a failed run', async () => {
  const metrics = new Metrics();
  const fetchImpl = (async (url: string | URL | Request) =>
    String(url).includes('/usage') ? Response.json([]) : Response.json({ chargeId: 'ch_2', status: 'failed' })) as typeof fetch;
  await withServer(createApp({ fetchImpl, metrics }), async (base) => {
    assert.equal((await startRun(base, 't1')).status, 202);
  });
  assert.match(metrics.renderPrometheus(), /^billing_runs_total\{status="failed"\} 1$/m);
});

test('GET /internal/metrics rejects a missing or wrong internal token', async () => {
  await withServer(createApp(), async (base) => {
    const missing = await fetch(`${base}/internal/metrics`);
    assert.equal(missing.status, 401);
    const wrong = await fetch(`${base}/internal/metrics`, { headers: { 'x-internal-token': 'guess' } });
    assert.equal(wrong.status, 401);
    assert.doesNotMatch(await wrong.text(), /billing_runs_total|test-internal-token/);
  });
});

test('metrics are no longer served on the public /metrics path', async () => {
  await withServer(createApp(), async (base) => {
    const res = await fetch(`${base}/metrics`, { headers: internalHeaders });
    assert.equal(res.status, 404);
  });
});

test('internal endpoints fail closed when INTERNAL_TOKEN is not configured', async () => {
  const saved = process.env.INTERNAL_TOKEN;
  delete process.env.INTERNAL_TOKEN;
  clearSecretCache();
  try {
    await withServer(createApp(), async (base) => {
      const res = await fetch(`${base}/internal/metrics`, { headers: { 'x-internal-token': '' } });
      assert.equal(res.status, 503);
    });
  } finally {
    process.env.INTERNAL_TOKEN = saved;
    clearSecretCache();
  }
});
