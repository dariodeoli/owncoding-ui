import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BLOG_ARTICLES } from '../gallery/blog/articles.js'
import { LIMITE_ARCHIVO, LIMITE_TOTAL, excluido, leerPatrones, medirContexto } from '../scripts/verificar-contexto-build.mjs'

const patrones = leerPatrones(readFileSync('.dockerignore', 'utf8'))

describe('contexto de build de la galería', () => {
  it('.dockerignore sigue excluyendo lo que el build no usa', () => {
    for (const ruta of ['docs/qa/r1/flujo.har.gz', 'docs/README.md', 'design/x.fig', 'test/a.test.js', 'tests/a.js', 'e2e/a.spec.ts',
      'coverage/index.html', 'playwright-report/index.html', 'test-results/a.png', '.claude/agents/x.md', '.atl/cache.json',
      'gallery/qa/captura.png', 'evidencia.har', 'paquete.zip', 'site-dist/index.html', 'node_modules/x/index.js']) {
      expect(excluido(ruta, patrones), ruta).toBe(true)
    }
  })

  it('no excluye lo que el build sí necesita', () => {
    for (const ruta of ['docs/financial-assets-manifest.json', 'src/index.js', 'gallery/main.jsx', 'gallery/public/status.json', 'scripts/build.mjs', 'types/index.d.ts',
      'package.json', 'package-lock.json', 'tailwind-preset.js', 'vite.gallery.config.js']) {
      expect(excluido(ruta, patrones), ruta).toBe(false)
    }
  })

  it('incluye todo archivo del repo que el blog cita como fuente (blog-check corre en el build)', () => {
    const fuentes = BLOG_ARTICLES.flatMap(articulo => articulo.sources || [])
      .map(fuente => fuente.url.split('https://github.com/dariodeoli/owncoding-ui/blob/main/')[1]).filter(Boolean)
    expect(fuentes.length).toBeGreaterThan(0)
    for (const ruta of fuentes) expect(excluido(ruta, patrones), ruta).toBe(false)
  })

  it('el contexto real queda bajo los límites', () => {
    const { total, grandes } = medirContexto()
    expect(total).toBeLessThan(LIMITE_TOTAL)
    expect(grandes.map(archivo => archivo.ruta)).toEqual([])
    expect(LIMITE_ARCHIVO).toBe(5 * 1024 * 1024)
  })

  it('Tailwind escanea solo la galería y src', () => {
    const config = readFileSync('vite.gallery.config.js', 'utf8')
    const archivos = config.match(/files:\s*\[([^\]]*)\]/)?.[1] ?? ''
    const globs = [...archivos.matchAll(/'([^']+)'/g)].map(m => m[1])
    expect(globs.length).toBeGreaterThan(0)
    for (const glob of globs) expect(glob, glob).toMatch(/^\.\/(gallery|src)\//)
  })

  it('el build de la galería verifica el contexto antes de construir', () => {
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts
    expect(scripts['gallery:build']).toMatch(/^node scripts\/verificar-contexto-build\.mjs && /)
  })
})
