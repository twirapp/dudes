import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    sourcemap: true,
    minify: false,
    emptyOutDir: false,
    lib: {
      entry: './src/index.ts',
      name: 'dudes',
      fileName: 'dudes',
    },
    rollupOptions: {
      external: [
        'gsap',
        'pixi.js',
        '@pixi/gif',
      ],
      output: {
        exports: 'named',
        globals: {
          'gsap': 'gsap',
          'pixi.js': 'pixi',
          '@pixi/gif': 'pixiGIF',
        },
      },
    },
  },
})
