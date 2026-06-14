/**
 * WCAG contrast helpers. Operate on the computed color strings Playwright returns
 * (rgb(...) / rgba(...) / transparent). No DOM access — pure functions, easy to test.
 */

/**
 * Parse a CSS color string into {r,g,b,a}. Handles rgb(), rgba(), #hex, and named
 * "transparent". Returns null for anything unparseable (e.g. gradients, currentColor).
 * @param {string} input
 * @returns {{r:number,g:number,b:number,a:number}|null}
 */
export function parseColor(input) {
  if (!input || typeof input !== "string") return null;
  const s = input.trim().toLowerCase();
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

  const rgb = s.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean);
    const r = clamp255(parseFloat(parts[0]));
    const g = clamp255(parseFloat(parts[1]));
    const b = clamp255(parseFloat(parts[2]));
    const a = parts[3] === undefined ? 1 : clamp01(parseFloat(parts[3]));
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b, a };
  }

  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length === 6 || h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }
  }
  return null;
}

function clamp255(n) {
  return Number.isNaN(n) ? NaN : Math.max(0, Math.min(255, Math.round(n)));
}
function clamp01(n) {
  return Number.isNaN(n) ? 1 : Math.max(0, Math.min(1, n));
}

/** Relative luminance per WCAG 2.x. @param {{r,g,b}} c */
export function relativeLuminance({ r, g, b }) {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Contrast ratio between two opaque colors. If the foreground has alpha < 1, it is
 * composited over the background first (approximation; good enough for text-over-surface).
 * @returns {number} ratio in [1, 21], or NaN if either color is unparseable.
 */
export function contrastRatio(fgStr, bgStr) {
  const fg = parseColor(fgStr);
  const bg = parseColor(bgStr);
  if (!fg || !bg) return NaN;
  const composited = fg.a < 1 ? compositeOver(fg, bg) : fg;
  const l1 = relativeLuminance(composited);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Alpha-composite fg over bg (bg assumed opaque). */
function compositeOver(fg, bg) {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

/**
 * The minimum AA ratio required for a given font size/weight.
 * @param {number} fontPx
 * @param {number} fontWeight
 * @param {{normal:number,large:number,largePx:number,largeBoldPx:number}} cfg
 */
export function requiredRatio(fontPx, fontWeight, cfg) {
  const isLarge =
    fontPx >= cfg.largePx || (fontPx >= cfg.largeBoldPx && fontWeight >= 700);
  return isLarge ? cfg.large : cfg.normal;
}
