import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/JaoVitorMS.github.io/',
  build: {
    outDir: 'dist',
  },
})