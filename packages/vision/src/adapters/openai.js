import { httpError } from "./util.js";

/** OpenAI chat completions (vision). BYO key via apiKey. */
export async function call({ system, user, images, apiKey, model }) {
  if (!apiKey) throw new Error("OpenAI requires an API key (OPENAI_API_KEY or --key).");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || "gpt-4o",
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: user },
            ...images.map((img) => ({
              type: "image_url",
              image_url: { url: `data:${img.mime};base64,${img.base64}` },
            })),
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw await httpError("OpenAI", res);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}
