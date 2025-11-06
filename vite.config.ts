import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // 由 workflow 注入；本地/默认依然用 "/"
  base: process.env.VITE_BASE || "/",
});
