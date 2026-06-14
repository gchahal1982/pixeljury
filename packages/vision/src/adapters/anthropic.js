import { httpError } from "./util.js";

/** Anthropic Messages API (vision). BYO key via apiKey. */
export async function call({ system, user, images, apiKey, model }) {
  if (!apiKey) throw new Error("Anthropic requires an API key (ANTHROPIC_API_KEY or --key).");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-6",
      max_tokens: 1500,
      temperature: 0.2,
      system,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: user },
            ...images.map((img) => ({
              type: "image",
              source: { type: "base64", media_type: img.mime, data: img.base64 },
            })),
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw await httpError("Anthropic", res);
  const data = await res.json();
  const block = (data?.content || []).find((b) => b.type === "text");
  return block?.text || "";
}
