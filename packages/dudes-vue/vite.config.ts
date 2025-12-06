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
      name: 'dudes-vue',
      fileName: 'dudes-vue'
    },
    rollupOptions: {
      external: [
        'vue',
        '@twirapp/dudes'
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@twirapp/dudes': 'dudes'
        }
      }
    }
  }
})
