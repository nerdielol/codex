/*
 * Utility helpers for retry/backoff behaviour around OpenAI rate‑limit errors.
 */

export function isRateLimitError(err: unknown): boolean {
  if (!err) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  return (
    e.code === "rate_limit_exceeded" ||
    e?.error?.code === "rate_limit_exceeded" ||
    e.status === 429 ||
    e?.response?.status === 429 ||
    (typeof e.message === "string" && /rate limit/i.test(e.message))
  );
}

/**
 * Exponential backoff with jitter.
 *
 * @param attempt 1‑based retry attempt number (i.e. first retry == 1)
 * @param baseDelayMs Initial delay before the first retry in ms (default 1000).
 * @param maxDelayMs Upper bound for delay (default 60000).
 */
export function computeBackoffDelay(
  attempt: number,
  baseDelayMs = 1000,
  maxDelayMs = 60_000,
): number {
  // Exponential backoff: base * 2^(attempt‑1)
  const expDelay = baseDelayMs * 2 ** (attempt - 1);
  // Full‑jitter approach (AWS strategy): random between 0 and expDelay
  const jitter = Math.random() * expDelay;
  return Math.min(jitter, maxDelayMs);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
