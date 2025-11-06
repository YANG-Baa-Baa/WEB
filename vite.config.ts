/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

function getPlugins() {
  const plugins = [react(), tsconfigPaths()];
  return plugins;
}

// 由 GitHub Actions 注入：/WEB/（GitHub 默认） 或 /（自定义域名）
const BASE = process.env.VITE_BASE || "/";

export default defineConfig({
  plugins: getPlugins(),
  base: BASE
});
