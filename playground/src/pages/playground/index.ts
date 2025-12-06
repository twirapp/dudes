import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './playground.vue'

import './index.css'

createApp(App).use(createPinia()).mount('#app')

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    location.reload()
  })
}
