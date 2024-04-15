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
      name: 'dudes-demo',
      fileName: 'dudes-demo'
    },
    rollupOptions: {
      external: [
        'pixi.js'
      ],
      output: {
        exports: 'named',
        globals: {
          'pixi.js': 'pixi'
        }
      }
    }
  }
})
