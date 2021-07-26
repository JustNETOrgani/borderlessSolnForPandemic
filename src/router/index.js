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
  },
  // Country-level
  {
    path: '/Country_level/login',
    name: 'countryLogin',
    component: () => import('@/views/Country_level/login.vue')
  },
  {
    path: '/Country_level/countryLanding',
    name: 'countryIndexPage',
    component: () => import('@/views/Country_level/countryLanding.vue')
  },
  {
    path: '/Country_level/registerTC',
    name: 'countryRegistTC',
    component: () => import('@/views/Country_level/registerTC.vue')
  },
  {
    path: '/Country_level/revokeTC',
    name: 'countryRevokeTC',
    component: () => import('@/views/Country_level/revokeTC.vue')
  },
  {
    path: '/Country_level/reactivateTC',
    name: 'countryReactivateTC',
    component: () => import('@/views/Country_level/reactivateTC.vue')
  },
  // Testing Center.
  {
    path: '/Country_level/TC/login',
    name: 'countryTClogin',
    component: () => import('@/views/Country_level/TC/login.vue')
  },
  {
    path: '/Country_level/TC/tcLanding',
    name: 'countryTClanding',
    component: () => import('@/views/Country_level/TC/tcLanding.vue')
  }
  // Verifiers.

  // Person.
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
