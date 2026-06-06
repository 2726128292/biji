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
      name: 'notes',
      component: () => import('@/views/NotesView.vue'),
      props: true
    },
    {
      path: '/notes/:noteId',
      name: 'noteDetail',
      component: () => import('@/views/NotesView.vue'),
      props: true
    },
    {
      path: '/questions',
      name: 'questions',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/questions/:bankId',
      name: 'bankDetail',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/questions/:bankId/folder/:folderId',
      name: 'folderDetail',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('@/views/PracticeView.vue'),
      props: true
    },
    {
      path: '/practice/report/:sessionId',
      name: 'practiceReport',
      component: () => import('@/views/PracticeView.vue'),
      props: true
    },
    {
      path: '/wrongbook/:wrongBookId',
      name: 'wrongbook',
      component: () => import('@/views/QuestionsView.vue'),
      props: true
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    }
  ]
})

export default router
