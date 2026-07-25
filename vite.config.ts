import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANT: "base" must match your GitHub repo name exactly, wrapped in slashes.
// e.g. if your repo is github.com/yourname/mhe-toolkit, base stays "/mhe-toolkit/"
// If you rename the repo, update this to match.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // manifest: false — public/manifest.json is already hand-maintained
      // and linked from index.html (drives "Add to Home Screen" on iOS);
      // this plugin only adds the service worker for offline asset caching.
      manifest: false,
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      workbox: {
        // precache the built app shell (including manifest.json, so the
        // installed-PWA metadata is available offline too) so the toolkit
        // still opens — and keeps working on whatever screen it's on —
        // with no signal, which matters for a field-reference tool used
        // in warehouses.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"],
      },
    }),
  ],
  base: "/mhe-toolkit/",
});
