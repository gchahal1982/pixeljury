/**
 * Stage 1 — Render.
 *
 * Loads the target URL in headless Chromium, captures a full-page desktop screenshot and a
 * 390px mobile screenshot, and extracts a DOM/CSS snapshot of every visible element.
 *
 * ── Integration contract: dom-snapshot ──────────────────────────────────────────────────
 * Consumed by static-signals.js. Shape:
 *   {
 *     url, desktop: ViewportSnapshot, mobile: ViewportSnapshot, fonts: string[]
 *   }
 *   ViewportSnapshot = { width, height, scrollWidth, elements: Element[] }
 *   Element = {
 *     tag, text, fontFamily, fontSize, fontWeight, color, bgColor, ownBgColor,
 *     backgroundImage, borderLeftWidth, borderRadius, hasBorder, hasShadow, padding,
 *     box:{x,y,w,h}, area, isInteractive, isTouchTarget, hasText, emoji, sig
 *   }
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

import path from "node:path";
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH } from "./rubric-data.js";

const MAX_ELEMENTS = 2500;

/** Thrown when the target URL can't be loaded — the #1 first-run failure. */
export class RenderError extends Error {
  constructor(message, { cause } = {}) {
    super(message);
    this.name = "RenderError";
    this.cause = cause;
  }
}

/**
 * @param {string} url
 * @param {object} opts
 * @param {string} opts.outDir       directory to write screenshots into
 * @param {number} [opts.timeout]    navigation timeout (ms)
 * @param {number} [opts.settle]     extra settle wait after load (ms)
 * @returns {Promise<{ snapshot: object, screenshots: { desktop: string, mobile: string } }>}
 */
export async function render(url, { outDir, timeout = 30000, settle = 800 } = {}) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (e) {
    throw new RenderError(
      "Playwright is not installed. Run `npx playwright install chromium` (or `npm i`).",
      { cause: e }
    );
  }

  const desktopPng = path.join(outDir, "screenshot.png");
  const mobilePng = path.join(outDir, "screenshot-390.png");

  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    throw new RenderError("Could not launch Chromium. Try `npx playwright install chromium`.", {
      cause: e,
    });
  }

  try {
    const desktop = await capture(browser, url, {
      width: DESKTOP_VIEWPORT_WIDTH,
      height: 900,
      screenshotPath: desktopPng,
      timeout,
      settle,
    });
    const mobile = await capture(browser, url, {
      width: MOBILE_VIEWPORT_WIDTH,
      height: 844,
      screenshotPath: mobilePng,
      timeout,
      settle,
      isMobile: true,
    });

    const fonts = uniquePrimaryFonts([...desktop.elements, ...mobile.elements]);

    return {
      snapshot: { url, desktop: strip(desktop), mobile: strip(mobile), fonts },
      screenshots: { desktop: desktopPng, mobile: mobilePng },
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

async function capture(browser, url, { width, height, screenshotPath, timeout, settle, isMobile }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: !!isMobile,
    hasTouch: !!isMobile,
    userAgent: isMobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  const page = await context.newPage();
  try {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout });
    } catch (e) {
      // networkidle can time out on pages with long-polling / live connections; fall back.
      try {
        await page.goto(url, { waitUntil: "load", timeout });
      } catch (e2) {
        throw new RenderError(
          `Could not load ${url} — is your dev server running on that port?`,
          { cause: e2 }
        );
      }
    }
    await page.waitForTimeout(settle);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const data = await page.evaluate(extractSnapshot, MAX_ELEMENTS);
    return data;
  } finally {
    await context.close().catch(() => {});
  }
}

function strip(vp) {
  return {
    width: vp.width,
    height: vp.height,
    scrollWidth: vp.scrollWidth,
    elements: vp.elements,
  };
}

function uniquePrimaryFonts(elements) {
  const set = new Set();
  for (const el of elements) {
    if (el.hasText && el.fontFamily) set.add(primaryFamily(el.fontFamily));
  }
  return [...set];
}

function primaryFamily(stack) {
  return String(stack)
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();
}

/* ──────────────────────────────────────────────────────────────────────────────────────
 * In-page extraction. Runs in the browser context — must be fully self-contained.
 * ────────────────────────────────────────────────────────────────────────────────────── */
function extractSnapshot(maxElements) {
  const emojiRe = /\p{Extended_Pictographic}/u;
  const interactiveTags = new Set(["a", "button", "input", "select", "textarea", "label"]);
  const touchTags = new Set(["a", "button", "input", "select", "textarea"]);

  function num(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function effectiveBg(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      const bg = getComputedStyle(node).backgroundColor;
      const m = bg && bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const parts = m[1].split(/[,\s/]+/).filter(Boolean);
        const a = parts[3] === undefined ? 1 : parseFloat(parts[3]);
        if (a > 0) return bg;
      }
      node = node.parentElement;
    }
    return "rgb(255, 255, 255)";
  }

  function normClass(el) {
    return Array.from(el.classList)
      .filter((c) => !/[0-9]/.test(c) && c.length < 40 && !/^(css|sc|jsx|emotion)-/.test(c))
      .sort()
      .join(".");
  }

  function directText(el) {
    let t = "";
    for (const node of el.childNodes) {
      if (node.nodeType === 3) t += node.textContent;
    }
    return t.replace(/\s+/g, " ").trim();
  }

  const all = Array.from(document.querySelectorAll("body *"));
  const elements = [];
  for (const el of all) {
    if (elements.length >= maxElements) break;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || num(cs.opacity) === 0) continue;

    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "noscript") continue;

    const text = directText(el);
    const childTags = Array.from(el.children).map((c) => c.tagName.toLowerCase()).join(">");
    const role = el.getAttribute("role");
    const isInteractive =
      interactiveTags.has(tag) ||
      role === "button" ||
      role === "link" ||
      el.hasAttribute("onclick") ||
      cs.cursor === "pointer";
    const isTouchTarget = touchTags.has(tag) || role === "button" || role === "link";

    elements.push({
      tag,
      text: text.slice(0, 120),
      fontFamily: cs.fontFamily,
      fontSize: num(cs.fontSize),
      fontWeight: num(cs.fontWeight) || 400,
      color: cs.color,
      bgColor: effectiveBg(el),
      ownBgColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      borderLeftWidth: num(cs.borderLeftWidth),
      borderRadius: num(cs.borderTopLeftRadius),
      hasBorder: num(cs.borderTopWidth) + num(cs.borderRightWidth) + num(cs.borderBottomWidth) + num(cs.borderLeftWidth) > 0,
      hasShadow: cs.boxShadow !== "none" && cs.boxShadow !== "",
      padding: Math.max(num(cs.paddingTop), num(cs.paddingRight), num(cs.paddingBottom), num(cs.paddingLeft)),
      box: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
      area: Math.round(rect.width * rect.height),
      isInteractive,
      isTouchTarget,
      hasText: text.length > 0,
      emoji: emojiRe.test(text),
      sig: tag + "|" + normClass(el) + "|" + childTags,
    });
  }

  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0),
    elements,
  };
}
