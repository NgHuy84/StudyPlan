import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // đường dẫn tương đối để chạy được trên GitHub Pages (https://<user>.github.io/StudyPlan/)
  base: './',
  server: { port: 5173, open: true },
});
