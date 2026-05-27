import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        analytics: resolve(__dirname, 'analytics.html'),
        ETP: resolve(__dirname, 'ETP.html'),
        IMP: resolve(__dirname, 'IMP.html'),
        CONT: resolve(__dirname, 'CONT.html'),
        PB: resolve(__dirname, 'PB.html'),
        coments: resolve(__dirname, 'coments.html'),
      },
    },
  },
})
