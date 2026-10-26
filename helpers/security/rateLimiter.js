const store = new Map()

const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_WINDOW_MS = 60 * 1000

export function checkRateLimit({
  key,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  windowMs = DEFAULT_WINDOW_MS,
}) {
  const now = Date.now()
  const record = store.get(key)

  if (!record) {
    return {
      allowed: true,
      count: 0,
      remaining: maxAttempts,
    }
  }

  // Window تمام شده
  if (now - record.firstAttempt >= windowMs) {
    store.delete(key)

    return {
      allowed: true,
      count: 0,
      remaining: maxAttempts,
    }
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.ceil(
      (windowMs - (now - record.firstAttempt)) / 1000,
    )

    return {
      allowed: false,
      count: record.count,
      remaining: 0,
      retryAfter,
    }
  }

  return {
    allowed: true,
    count: record.count,
    remaining: maxAttempts - record.count,
  }
}

export function recordFailure({
  key,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  windowMs = DEFAULT_WINDOW_MS,
}) {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now - record.firstAttempt >= windowMs) {
    store.set(key, {
      count: 1,
      firstAttempt: now,
    })

    return
  }

  record.count = Math.min(record.count + 1, maxAttempts)
}

export function resetRateLimit(key) {
  store.delete(key)
}
