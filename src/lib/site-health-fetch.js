// Safe bounded HTTP helpers for the authenticated site-health scanner.
export async function fetchWithoutRedirect(url, options = {}, fetcher = fetch) {
  const response = await fetcher(url, { ...options, redirect: "manual" });
  return { response, redirected: response.status >= 300 && response.status < 400 };
}
export async function readBoundedText(response, maxBytes) {
  const declared = Number(response.headers?.get?.("content-length") || 0);
  if (declared > maxBytes) {
    if (response.body) await response.body.cancel().catch(() => {});
    throw new RangeError("Response exceeds the configured size limit.");
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0, output = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new RangeError("Response exceeds the configured size limit.");
      }
      output += decoder.decode(value, { stream: true });
    }
    output += decoder.decode();
    return output;
  } finally { reader.releaseLock(); }
}
