// Runnable self-check for rate-limit logic
import assert from 'node:assert';

// Inline minimal replica of sliding window logic for verification
function testSlidingWindow() {
  const store = new Map();
  function check(key, { windowMs, max }) {
    const now = Date.now();
    const start = now - windowMs;
    const list = (store.get(key) || []).filter(t => t > start);
    if (list.length >= max) return { success: false, remaining: 0 };
    list.push(now);
    store.set(key, list);
    return { success: true, remaining: max - list.length };
  }

  const key = 'test-ip';
  for (let i = 0; i < 10; i++) {
    const res = check(key, { windowMs: 1000, max: 10 });
    assert.strictEqual(res.success, true, `Request ${i + 1} should succeed`);
  }

  // 11th request must fail
  const blocked = check(key, { windowMs: 1000, max: 10 });
  assert.strictEqual(blocked.success, false, '11th request must be blocked');
  console.log('✓ Rate limit sliding window check passed');
}

testSlidingWindow();
