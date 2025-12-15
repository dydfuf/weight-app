import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa";

import { APP_META } from "./src/config/app-meta";

function injectHtmlMetaFromAppMeta() {
  return {
    name: "inject-html-meta-from-app-meta",
    transformIndexHtml(html: string) {
      const themeColorTag = `<meta name="theme-color" content="${APP_META.themeColor}" />`;

      // Replace existing theme-color meta, or inject it before </head>.
      if (/<meta\s+name=["']theme-color["'][^>]*>/i.test(html)) {
        return html.replace(
          /<meta\s+name=["']theme-color["'][^>]*>/i,
          themeColorTag
        );
      }

      return html.replace("</head>", `  ${themeColorTag}\n  </head>`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    injectHtmlMetaFromAppMeta(),
    VitePWA({
      // We use `virtual:pwa-register/react` to register SW & drive the prompt UX.
      // Avoid double-registration by disabling auto injection.
      injectRegister: null,
      registerType: "prompt",
      devOptions: {
        enabled: false,
      },
      // Generate PWA icons (including Apple Touch icons) from a single source image.
      // This avoids keeping multiple PNGs committed manually.
      pwaAssets: {
        preset: "minimal-2023",
        image: "public/vite.svg",
        includeHtmlHeadLinks: false,
        overrideManifestIcons: true,
        injectThemeColor: false,
      },
      manifest: {
        name: APP_META.name,
        short_name: APP_META.shortName,
        theme_color: APP_META.themeColor,
        start_url: "/",
        scope: "/",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
