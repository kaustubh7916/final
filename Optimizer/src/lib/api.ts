const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return await res.json();
}

export async function optimizePrompt(prompt: string, profile: string = "neutral") {
  const res = await fetch(`${API_BASE}/api/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, profile })
  });
  if (!res.ok) {
    let msg = '';
    try { msg = (await res.json()).error; } catch {}
    throw new Error(msg || 'Optimize API error');
  }
  return await res.json();
}
