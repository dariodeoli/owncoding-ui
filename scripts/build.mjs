// Build del paquete: un solo bundle ESM (`dist/index.js`), los tipos
// declarados y las tres hojas CSS (`styles.css` = tokens + base, `tokens.css`
// sola y `base.css` sola). Sin TypeScript: los `.d.ts` se escriben a mano en
// `types/` y se copian tal cual al `dist/` publicado.
import { build } from 'esbuild'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  target: 'es2020',
  platform: 'neutral',
  jsx: 'automatic',
  sourcemap: true,
  external: ['react', 'react-dom', 'clsx', 'tailwind-merge', 'qrcode'],
  banner: { js: '"use client"' },
  logLevel: 'info',
})

mkdirSync('dist', { recursive: true })
const tokens = readFileSync('src/styles/tokens.css', 'utf8')
const base = readFileSync('src/styles/base.css', 'utf8')
copyFileSync('src/styles/tokens.css', 'dist/tokens.css')
copyFileSync('src/styles/base.css', 'dist/base.css')
// `styles.css` sigue siendo autocontenido (compatible con v0.13.1): se arma
// concatenando, así ninguna herramienta tiene que resolver `@import`.
writeFileSync('dist/styles.css', `${tokens.trimEnd()}\n\n${base}`)
copyFileSync('types/index.d.ts', 'dist/index.d.ts')
console.log('build ok: dist/index.js + dist/index.d.ts + dist/styles.css + dist/tokens.css + dist/base.css')
