import { resolve } from "node:path";
import { defineConfig } from "vite";
import { mapTemplatesPlugin } from "./vite-plugins/map-templates";

export default defineConfig({
  plugins: [mapTemplatesPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        jelly_preview: resolve(__dirname, "jelly_preview.html"),
        map_preview: resolve(__dirname, "map_preview.html"),
        template_library: resolve(__dirname, "template_library.html"),
      },
    },
  },
});
