import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Habit Tracker",
        short_name: "Habits",
        description: "Трекер привычек для ежедневного прогресса",
        theme_color: "#17212b",
        background_color: "#17212b",
        display: "standalone",
        orientation: "portrait",
        lang: "ru",
        icons: [
          {
            src: "vite.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "vite.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
