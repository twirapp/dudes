import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app.vue'
import { router } from './router'

import './index.scss'
import '../playground/index.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    location.reload()
  })
}
