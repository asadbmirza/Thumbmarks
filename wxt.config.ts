import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Thumbmark's - Visual Bookmarks",
    description:
      "Introducing Thumbmarks, the intelligent Chrome Extension that transforms how you save and revisit webpages.",
    version: "1.0.3",
    permissions: [
      "storage",
      "scripting",
      "activeTab",
      "contextMenus",
      "sidePanel",
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
