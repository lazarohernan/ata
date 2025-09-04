import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['vue'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['@headlessui/vue', '@heroicons/vue'],
          charts: ['chart.js', 'vue-chartjs'],
          utils: ['axios', 'pinia']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
});
