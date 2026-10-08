import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The standalone preview uses /. The personal site build lives under /ap-statistics/.
  base: process.env.GITHUB_PAGES === "true" ? "/ap-statistics/" : "/",
});
