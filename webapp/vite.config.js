import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
          deck: ['@deck.gl/react', '@deck.gl/geo-layers'],
          h3: ['h3-js'],
        }
      }
    }
  }
})
