import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "src/ui",
  base: "/ui/",
  build: {
    outDir: "../../public/ui",
    emptyOutDir: true,
    manifest: true
  },
  server: {
    host: "0.0.0.0",
    port: 5174
  }
});
