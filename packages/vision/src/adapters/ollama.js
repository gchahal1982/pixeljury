import { httpError } from "./util.js";

/** Local Ollama chat (vision model, e.g. llama3.2-vision). No key, no cost. */
export async function call({ system, user, images, model }) {
  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  let res;
  try {
    res = await fetch(`${host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "llama3.2-vision",
        stream: false,
        format: "json",
        options: { temperature: 0.2 },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user, images: images.map((img) => img.base64) },
        ],
      }),
    });
  } catch (e) {
    throw new Error(`Could not reach Ollama at ${host} — is it running? (${e.message})`);
  }
  if (!res.ok) throw await httpError("Ollama", res);
  const data = await res.json();
  return data?.message?.content || "";
}
