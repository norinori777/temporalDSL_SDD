import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://saas-backend:3201',
        changeOrigin: true,
      },
    },
  },
});