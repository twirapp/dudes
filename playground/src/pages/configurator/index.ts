import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './app.vue'
import Editor from './dude-editor.vue'

import './index.scss'
import '../playground/index.scss'

createApp(Editor).use(createPinia()).mount('#app')

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    location.reload()
  })
}
