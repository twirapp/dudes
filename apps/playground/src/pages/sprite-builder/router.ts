import { createMemoryHistory, createRouter } from 'vue-router'

export const Route = {
  Configurator: '/catalog',
  Catalog: '/'
}

export const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: Route.Configurator,
      component: () => import('./configurator.vue')
    },
    {
      path: Route.Catalog,
      component: () => import('./catalog.vue')
    }
  ]
})
