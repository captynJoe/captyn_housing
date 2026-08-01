import { defineConfig } from "vite";

export default defineConfig({
  base: "/resident-app/",
  publicDir: false,
  build: {
    outDir: "public/resident-app",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: "src/resident/main.ts",
      output: {
        entryFileNames: "assets/resident.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "assets/resident.css";
          }
          return "assets/[name][extname]";
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5175
  }
});
