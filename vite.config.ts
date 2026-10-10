// vite.config.ts

// Resolve ULDE aliases

import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@ulde/configurator": path.resolve(__dirname, "./src/ulde/configurator"),
      "@ulde/core": path.resolve(__dirname, "./src/ulde/core"),
      "@ulde/devtools": path.resolve(__dirname, "./src/ulde/devtools"),
      "@ulde/engine": path.resolve(__dirname, "./src/ulde/engine"),
      "@ulde/plugins": path.resolve(__dirname, "./src/ulde/plugins"),
      // "@ulde/plugins/system/content": path.resolve(__dirname, "./src/ulde/plugins/system/content"),
      "@ulde/tools": path.resolve(__dirname, "./src/ulde/tools"),
      "@ulde/types": path.resolve(__dirname, "./src/ulde/types"),
      "@ulde/viewer": path.resolve(__dirname, "./src/ulde/viewer"),
    }

  }
});
