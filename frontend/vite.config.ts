import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/yupay-api': {
        target: 'https://api.yupay.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yupay-api/, ''),
        secure: true
      }
    }
  }
});
