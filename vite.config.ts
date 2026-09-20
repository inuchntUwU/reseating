import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 独自ドメイン（reseating.inuch.net）のルートで配信する
  base: '/',
  plugins: [react()],
})
