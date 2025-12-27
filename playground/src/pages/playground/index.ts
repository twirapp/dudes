import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './playground.vue'

import './index.scss'

const tweakpaneRoot = document.createElement('div')
tweakpaneRoot.id = 'tweakpane'
document.body.append(tweakpaneRoot)

createApp(App).use(createPinia()).mount('#app')

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    location.reload()
  })
}
