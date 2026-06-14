import { httpError } from "./util.js";

/** Google Gemini generateContent (vision). BYO key via apiKey. */
export async function call({ system, user, images, apiKey, model }) {
  if (!apiKey) throw new Error("Gemini requires an API key (GEMINI_API_KEY or --key).");
  const m = model || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [
        {
          role: "user",
          parts: [
            { text: user },
            ...images.map((img) => ({ inline_data: { mime_type: img.mime, data: img.base64 } })),
          ],
        },
      ],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw await httpError("Gemini", res);
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("");
}
