import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'
import { createMpaPlugin } from 'vite-plugin-virtual-mpa'

import tailwind from 'tailwindcss'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    createMpaPlugin({
      htmlMinify: true,
      pages: [
        {
          name: 'index',
          filename: 'index.html',
          entry: '/src/pages/playground/index.ts',
          data: {
            title: 'Dudes Playground'
          }
        },
        {
          name: 'overlay',
          filename: 'overlay.html',
          entry: '/src/pages/overlay/index.ts',
          data: {
            title: 'Dudes Overlay'
          }
        },
        {
          name: 'configurator',
          filename: 'configurator.html',
          entry: '/src/pages/configurator/index.ts',
          data: {
            title: 'Dudes Configurator'
          }
        }
      ]
    })

  ],
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()]
    }
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    force: true
  }
})
