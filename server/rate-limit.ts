// Limits how many requests one visitor can make per minute. Every chat
// message costs AI quota, so a public app needs this.
// ponytail: in memory, per process. Use Redis or similar if you run
// several server instances.

const WINDOW_MS = 60_000

// Returns a function: call it with a visitor key (their IP).
// It answers 0 if the request may go ahead, otherwise how many seconds
// until they may try again.
export function createRateLimiter(perMinute: number) {
  const windows = new Map<string, { count: number; resetAt: number }>()

  return function check(key: string, now = Date.now()): number {
    // Forget finished windows now and then, so memory doesn't grow
    if (windows.size > 10_000) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k)
    }

    const window = windows.get(key)
    if (!window || window.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + WINDOW_MS })
      return 0
    }
    if (window.count < perMinute) {
      window.count++
      return 0
    }
    return Math.ceil((window.resetAt - now) / 1000)
  }
}
