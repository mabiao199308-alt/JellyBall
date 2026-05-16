import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        jelly_preview: resolve(__dirname, "jelly_preview.html"),
        map_preview: resolve(__dirname, "map_preview.html"),
      },
    },
  },
});
