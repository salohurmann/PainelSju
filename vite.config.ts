import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Bibliotecas em pedaços próprios: mudam pouco, então ficam no cache entre deploys.
const VENDOR: Array<[string, RegExp]> = [
  ['react', /node_modules[\\/](react|react-dom|scheduler)[\\/]/],
  ['supabase', /node_modules[\\/]@supabase[\\/]/],
  ['icones', /node_modules[\\/]lucide-react[\\/]/],
]

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [nome, re] of VENDOR) if (re.test(id)) return nome
        },
      },
    },
  },
})
