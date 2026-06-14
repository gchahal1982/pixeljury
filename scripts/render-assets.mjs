/**
 * Renders the brand images (banner + social card) from assets/*.html → assets/*.png
 * using the same headless Chromium PixelJury already depends on.
 *
 *   node scripts/render-assets.mjs
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");

const targets = [
  { html: "assets/banner.html", png: "assets/banner.png", w: 1280, h: 400 },
  { html: "assets/social.html", png: "assets/social.png", w: 1280, h: 640 },
];

const browser = await chromium.launch();
try {
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto("file://" + path.join(root, t.html), { waitUntil: "networkidle" });
    await page.waitForTimeout(600); // let webfonts settle
    await page.screenshot({ path: path.join(root, t.png), clip: { x: 0, y: 0, width: t.w, height: t.h } });
    await ctx.close();
    console.log("rendered", t.png);
  }
} finally {
  await browser.close();
}
