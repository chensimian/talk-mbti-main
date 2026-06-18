import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomePage.vue') },
  { path: '/mode', name: 'Mode', component: () => import('../views/ModeSelectorPage.vue') },
  { path: '/tags', name: 'Tags', component: () => import('../views/TagsPage.vue') },
  { path: '/chat', name: 'Chat', component: () => import('../views/ChatPage.vue') },
  { path: '/report', name: 'Report', component: () => import('../views/ReportPage.vue') },
  { path: '/student-report', name: 'StudentReport', component: () => import('../views/StudentReportPage.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/LoginPage.vue') },
  { path: '/history', name: 'History', component: () => import('../views/HistoryPage.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/ProfilePage.vue') },
  { path: '/consult', name: 'Consult', component: () => import('../views/ConsultPage.vue') },
  { path: '/birth-info', name: 'BirthInfo', component: () => import('../views/BirthInfoPage.vue') },
  { path: '/mystical-report', name: 'MysticalReport', component: () => import('../views/MysticalReportPage.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
