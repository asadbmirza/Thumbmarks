import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Thumbmark's - Visual Bookmarks",
    version: "1.0.0",
    permissions: [
      "storage",
      "scripting",
      "activeTab",
      "tabs",
      "contextMenus",
      "sidePanel",
      "notifications",
      "downloads",
    ],
    host_permissions: ["https://*.supabase.co/*"],
    background: {
      service_worker: "src/entrypoints/background/index.ts",
    },
    side_panel: {
      default_path: "popup.html",
    },
  },
});
