import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths let the same build run in the separate subject directories.
  base: process.env.GITHUB_PAGES === "true" ? "./" : "/",
});
