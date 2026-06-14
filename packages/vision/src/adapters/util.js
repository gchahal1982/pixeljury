/** Build a readable Error from a failed fetch Response (status + truncated body). */
export async function httpError(provider, res) {
  let body = "";
  try {
    body = await res.text();
  } catch {
    /* ignore */
  }
  const snippet = body ? ` — ${body.slice(0, 300)}` : "";
  return new Error(`${provider} API error ${res.status} ${res.statusText}${snippet}`);
}
