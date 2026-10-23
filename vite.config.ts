import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import type { Plugin } from 'vite'

/**
 * Gera dist/sw.js com a lista dos arquivos deste build (cache para uso offline).
 * A versão muda a cada build, e o service worker antigo apaga o cache velho.
 */
function serviceWorker(): Plugin {
  const PUBLICOS = ['./', 'manifest.webmanifest', 'favicon.svg', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/icone-maskable-512.png', 'icones/apple-touch-icon.png', 'brasao-parana.png']
  return {
    name: 'seju-service-worker',
    apply: 'build',
    generateBundle(_opcoes, bundle) {
      // Fontes: só o alfabeto latino (português); outras variantes entram no cache se forem usadas.
      const gerados = Object.keys(bundle).filter(f => /\.(js|css|svg|png)$/.test(f) || /-latin-wght-.*\.woff2$/.test(f))
      const arquivos = [...PUBLICOS, ...gerados.sort()]
      const versao = createHash('sha256').update(gerados.join('|')).digest('hex').slice(0, 12)
      const fonte = readFileSync(new URL('./pwa/sw.js', import.meta.url), 'utf8')
        .replace('__VERSAO__', versao)
        .replace('__ARQUIVOS__', JSON.stringify(arquivos))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: fonte })
    },
  }
}

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
    serviceWorker(),
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
