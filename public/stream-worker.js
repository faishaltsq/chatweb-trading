self.addEventListener('message', async (e) => {
  const { type, url, body, headers } = e.data;

  if (type !== 'stream') return;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!res.ok || !res.body) {
      self.postMessage({ type: 'error', error: `HTTP ${res.status}` });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        self.postMessage({ type: 'done' });
        break;
      }
      self.postMessage({ type: 'chunk', chunk: decoder.decode(value, { stream: true }) });
    }
  } catch (err) {
    self.postMessage({ type: 'error', error: String(err) });
  }
});
