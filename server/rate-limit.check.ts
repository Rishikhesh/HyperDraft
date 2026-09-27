// Self-check for the rate limiter. Run: bun server/rate-limit.check.ts
import { ok } from 'node:assert'
import { createRateLimiter } from './rate-limit'

const check = createRateLimiter(3) // 3 per minute
const t = 1_000_000 // a fixed "now", so the test doesn't depend on time

const first3 = [check('a', t), check('a', t), check('a', t)]
ok(first3.join() === '0,0,0', 'first 3 allowed')
ok(check('a', t + 1000) === 59, '4th waits 59s')
ok(check('b', t) === 0, 'other visitors unaffected')
ok(check('a', t + 60_000) === 0, 'new minute, allowed again')

console.log('rate-limit checks done')
