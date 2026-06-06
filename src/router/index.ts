import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/notes'
    },
    {
      path: '/notes',
      component: () => import('@/views/NotesView.vue'),
      props: true
    },
    {
      path: '/notes/:noteId',
      component: () => import('@/views/NotesView.vue'),
      props: true
    },
    {
      path: '/questions',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/questions/:bankId',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/questions/:bankId/folder/:folderId',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/practice',
      component: () => import('@/views/PracticeView.vue'),
      props: true
    },
    {
      path: '/practice/report/:sessionId',
      component: () => import('@/views/PracticeView.vue'),
      props: true
    },
    {
      path: '/wrongbook/:wrongBookId',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/settings',
      component: () => import('@/views/SettingsView.vue')
    }
  ]
})

export default router
