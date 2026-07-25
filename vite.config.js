import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: "base" must match your GitHub repo name exactly, wrapped in slashes.
// e.g. if your repo is github.com/yourname/mhe-toolkit, base stays "/mhe-toolkit/"
// If you rename the repo, update this to match.
export default defineConfig({
  plugins: [react()],
  base: "/mhe-toolkit/",
});
