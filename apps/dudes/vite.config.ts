import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    minify: false,
    emptyOutDir: false,
    lib: {
      entry: './src/index.ts',
      name: 'dudes',
      fileName: 'dudes'
    },
    rollupOptions: {
      external: [
        'vue',
        'gsap',
        'pixi.js',
        '@pixi/gif'
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          gsap: 'gsap',
          'pixi.js': 'pixi',
          '@pixi/gif': 'pixiGIF'
        }
      }
    }
  }
})
