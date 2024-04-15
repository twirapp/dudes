import { createApp } from 'vue'

import App from './dudes-demo.vue'

import './index.css'

createApp(App).mount('#app')

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    location.reload()
  })
}
