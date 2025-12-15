/**
 * Single source of truth for app meta used by:
 * - Web App Manifest (PWA)
 * - HTML meta tags (e.g. theme-color)
 *
 * Theme color source: `src/index.css` -> `:root { --primary: oklch(0.65 0.18 132); }`
 * Converted to sRGB hex for broad compatibility in manifest + meta tags.
 */
export const APP_META = {
  name: "weight app",
  shortName: "weight app",
  themeColor: "#63a402",
} as const;
