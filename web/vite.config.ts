import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@tensorflow/tfjs')) return 'tfjs';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('framer-motion') || id.includes('gsap')) return 'motion';
        },
      },
    },
  },
});
