import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-workflow:3001',
        changeOrigin: true,
      },
    },
  },
});