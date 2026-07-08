import fs from "node:fs";
import path from "node:path";

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

export function stageImages(imagePaths, tmpDir) {
  return imagePaths
    .filter(Boolean)
    .map((imagePath, index) => {
      const source = path.resolve(imagePath);
      if (!fs.existsSync(source)) throw new Error(`Screenshot file not found: ${source}`);
      const ext = path.extname(source) || ".png";
      const target = path.join(tmpDir, `screenshot-${index}${ext}`);
      fs.copyFileSync(source, target);
      return target;
    });
}
