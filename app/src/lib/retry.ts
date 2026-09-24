// Shared retry helper with exponential backoff and jitter.
// Use this for every outbound call that may be retried. Do not write a
// bespoke loop per client.

export interface RetryOptions {
  attempts?: number;       // total attempts including the first, default 3
  baseDelayMs?: number;    // default 100
  maxDelayMs?: number;     // default 2000; caps backoff, not a server's Retry-After
  isRetryable?: (err: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
  onRetry?: (attempt: number, err: unknown) => void;
}

export class RetryError extends Error {
  readonly attempts: number;
  readonly cause: unknown;
  constructor(message: string, attempts: number, cause: unknown) {
    super(message);
    this.name = 'RetryError';
    this.attempts = attempts;
    this.cause = cause;
  }
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function isTransientHttpError(err: unknown): boolean {
  if (err instanceof UpstreamError) return err.status >= 500 || err.status === 429;
  return err instanceof TypeError; // network failure from fetch
}

export class UpstreamError extends Error {
  readonly status: number;
  readonly retryAfterMs?: number;
  constructor(status: number, message: string, retryAfterMs?: number) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

// Retry-After is either delay-seconds or an HTTP date (RFC 9110).
export function parseRetryAfter(value: string | null, now: number = Date.now()): number | undefined {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000;
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - now);
}

function requestedDelayMs(err: unknown): number {
  return err instanceof UpstreamError && err.retryAfterMs !== undefined ? err.retryAfterMs : 0;
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 100;
  const max = opts.maxDelayMs ?? 2000;
  const isRetryable = opts.isRetryable ?? isTransientHttpError;
  const sleep = opts.sleep ?? defaultSleep;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === attempts || !isRetryable(err)) break;
      opts.onRetry?.(attempt, err);
      const exp = Math.min(max, base * 2 ** (attempt - 1));
      const jitter = Math.floor(Math.random() * exp * 0.2);
      await sleep(Math.max(exp + jitter, requestedDelayMs(err)));
    }
  }
  throw new RetryError(`Gave up after ${attempts} attempt(s)`, attempts, lastErr);
}
