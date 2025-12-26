import { createRouter, createWebHashHistory } from 'vue-router'

export const PLATFORM_ROUTES = [
  {
    label: 'Library',
    path: '/library',
  },
  {
    label: 'Editor',
    path: '/editor',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/library',
    },
    {
      path: '/library',
      component: () => import('./routes/library/dudes-library.vue'),
    },
    {
      path: '/editor',
      component: () => import('./routes/editor/editor.vue'),
    },
  ],
})
