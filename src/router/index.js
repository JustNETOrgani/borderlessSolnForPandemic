import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // Contract Delployer = WHO.
  {
    path: '/WHO/login',
    name: 'WHOlogin',
    component: () => import('@/views/WHO/login.vue')
  }

  // Health facility.

  // Verifiers.

  // Person.
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
