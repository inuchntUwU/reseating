import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages はリポジトリ名のサブパスで配信される
  base: '/reseating/',
  plugins: [react()],
})
