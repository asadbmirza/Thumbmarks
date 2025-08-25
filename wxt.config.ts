import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'Thumbmark\'s - Visual Bookmarks',
    version: '1.0.0',
    permissions: ['storage', 'scripting', 'activeTab', 'tabs'], 
    host_permissions: ['<all_urls>'],
  }
});
