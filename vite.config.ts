import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    host: true,
    strictPort: false,
    watch: {
      ignored: ['**/smartdesk.db*', '**/smartdesk.db-wal*', '**/smartdesk.db-shm*']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5180',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
