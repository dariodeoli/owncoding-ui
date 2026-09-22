/**
 * Preset de Tailwind de OwnCoding UI.
 *
 * Uso en la app:
 *   // tailwind.config.js
 *   import preset from 'owncoding-ui/tailwind-preset'
 *   export default { presets: [preset], content: [...] }
 *
 * La paleta sale de CSS vars (`--c-*`), así cada app cambia su acento sin
 * tocar la librería: definí los valores en `:root` y `.dark`. Ver
 * `owncoding-ui/styles.css` para los valores de referencia.
 */
export default {
  darkMode: 'class',
  // La app debe escanear también el bundle de la librería: si no, Tailwind
  // purga las clases de los componentes compartidos. Un preset puede declarar
  // `content` y Tailwind lo combina con el de la app.
  content: ['./node_modules/owncoding-ui/dist/**/*.js'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        fore: 'rgb(var(--c-fore) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          950: 'rgb(var(--c-ink-950) / <alpha-value>)',
          900: 'rgb(var(--c-ink-900) / <alpha-value>)',
          800: 'rgb(var(--c-ink-800) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          600: 'rgb(var(--c-ink-600) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
        },
        // Acento de la app (token fono, configurable por CSS var)
        fono: {
          DEFAULT: 'rgb(var(--c-fono) / <alpha-value>)',
          dark: 'rgb(var(--c-fono-dark) / <alpha-value>)',
          light: 'rgb(var(--c-fono-light) / <alpha-value>)',
          glow: 'rgb(var(--c-fono-glow) / <alpha-value>)',
          soft: 'rgb(var(--c-fono) / .12)',
        },
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        bad: 'rgb(var(--c-bad) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
        reserved: 'rgb(var(--c-reserved) / <alpha-value>)',
        // Verde pass/certificado y azul acción del tema consola (épica #241)
        pass: {
          DEFAULT: 'rgb(var(--c-pass) / <alpha-value>)',
          dark: 'rgb(var(--c-pass-dark) / <alpha-value>)',
          soft: 'rgb(var(--c-pass-soft) / <alpha-value>)',
        },
        accion: 'rgb(var(--c-accion) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        // Texto sobre el color de marca (en ambos temas)
        onbrand: 'rgb(var(--c-onbrand) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.10)',
        glow: '0 0 40px -10px rgb(var(--c-fono) / .45)',
      },
      backgroundImage: {
        'brand-blur': 'radial-gradient(120% 140% at 0% 0%, rgb(var(--c-fono)) 0%, rgb(var(--c-fono-dark)) 45%, rgb(var(--c-paper)) 100%)',
        'brand-line': 'linear-gradient(90deg, rgb(var(--c-fono)), rgb(var(--c-fono-light)))',
      },
    },
  },
  plugins: [],
}
