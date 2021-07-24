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
  },
  {
    path: '/WHO/WHOindex',
    name: 'WHOlandingPage',
    component: () => import('@/views/WHO/WHOindex.vue')
  },
  {
    path: '/WHO/registerCountry',
    name: 'countryRegistration',
    component: () => import('@/views/WHO/registerCountry.vue')
  },
  {
    path: '/WHO/revokeCountry',
    name: 'countryRevoke',
    component: () => import('@/views/WHO/revokeCountry.vue')
  },
  {
    path: '/WHO/reactivateCountry',
    name: 'countryReactivation',
    component: () => import('@/views/WHO/reactivateCountry.vue')
  },
  {
    path: '/WHO/updateCountry',
    name: 'countryTcUpdate',
    component: () => import('@/views/WHO/updateCountry.vue')
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
