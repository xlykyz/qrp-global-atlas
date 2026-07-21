import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), cesium()],
  server: { port: 5140, host: true, strictPort: true },
  preview: { port: 5141, strictPort: true },
  define: { CESIUM_BASE_URL: JSON.stringify('/cesium') },
});
