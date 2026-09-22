// Build del paquete: un solo bundle ESM (`dist/index.js`) + los tokens CSS.
// Sin TypeScript: el paquete se distribuye en JS/JSX y los tipos quedan como
// pendiente documentado en el README.
import { build } from 'esbuild'
import { copyFileSync, mkdirSync } from 'node:fs'

await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  target: 'es2020',
  platform: 'neutral',
  jsx: 'automatic',
  sourcemap: true,
  external: ['react', 'react-dom', 'clsx', 'tailwind-merge'],
  banner: { js: '"use client"' },
  logLevel: 'info',
})

mkdirSync('dist', { recursive: true })
copyFileSync('src/styles/tokens.css', 'dist/styles.css')
console.log('build ok: dist/index.js + dist/styles.css')
