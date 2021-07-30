import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requireAuth: false
    }
  },
  // Contract Delployer = WHO.
  {
    path: '/WHO/login',
    name: 'WHOlogin',
    component: () => import('@/views/WHO/login.vue'),
    meta: {
      requireAuth: false
    }
  },
  {
    path: '/WHO/WHOindex',
    name: 'WHOlandingPage',
    component: () => import('@/views/WHO/WHOindex.vue'),
    meta: {
      requireAuth: true,
      userType: 'WHO'
    }
  },
  {
    path: '/WHO/registerCountry',
    name: 'countryRegistration',
    component: () => import('@/views/WHO/registerCountry.vue'),
    meta: {
      requireAuth: true,
      userType: 'WHO'
    }
  },
  {
    path: '/WHO/revokeCountry',
    name: 'countryRevoke',
    component: () => import('@/views/WHO/revokeCountry.vue'),
    meta: {
      requireAuth: true,
      userType: 'WHO'
    }
  },
  {
    path: '/WHO/reactivateCountry',
    name: 'countryReactivation',
    component: () => import('@/views/WHO/reactivateCountry.vue'),
    meta: {
      requireAuth: true,
      userType: 'WHO'
    }
  },
  {
    path: '/WHO/updateCountry',
    name: 'countryTcUpdate',
    component: () => import('@/views/WHO/updateCountry.vue'),
    meta: {
      requireAuth: true,
      userType: 'WHO'
    }
  },
  // Country-level
  {
    path: '/Country_level/login',
    name: 'countryLogin',
    component: () => import('@/views/Country_level/login.vue'),
    meta: {
      requireAuth: false
    }
  },
  {
    path: '/Country_level/countryLanding',
    name: 'countryIndexPage',
    component: () => import('@/views/Country_level/countryLanding.vue'),
    meta: {
      requireAuth: true,
      userType: 'Country'
    }
  },
  {
    path: '/Country_level/registerTC',
    name: 'countryRegistTC',
    component: () => import('@/views/Country_level/registerTC.vue'),
    meta: {
      requireAuth: true,
      userType: 'Country'
    }
  },
  {
    path: '/Country_level/revokeTC',
    name: 'countryRevokeTC',
    component: () => import('@/views/Country_level/revokeTC.vue'),
    meta: {
      requireAuth: true,
      userType: 'Country'
    }
  },
  {
    path: '/Country_level/reactivateTC',
    name: 'countryReactivateTC',
    component: () => import('@/views/Country_level/reactivateTC.vue'),
    meta: {
      requireAuth: true,
      userType: 'Country'
    }
  },
  // Testing Center.
  {
    path: '/Country_level/TC/login',
    name: 'countryTClogin',
    component: () => import('@/views/Country_level/TC/login.vue'),
    meta: {
      requireAuth: false
    }
  },
  {
    path: '/Country_level/TC/tcLanding',
    name: 'countryTClanding',
    component: () => import('@/views/Country_level/TC/tcLanding.vue'),
    meta: {
      requireAuth: true,
      userType: 'TC'
    }
  },
  {
    path: '/Country_level/TC/enrollPatient',
    name: 'countryTCEnrollingPatient',
    component: () => import('@/views/Country_level/TC/enrollPatient.vue'),
    meta: {
      requireAuth: true,
      userType: 'TC'
    }
  },
  {
    path: '/Country_level/TC/updatePatientInfo',
    name: 'countryTCupdatePatientInfo',
    component: () => import('@/views/Country_level/TC/updatePatientInfo.vue'),
    meta: {
      requireAuth: true,
      userType: 'TC'
    }
  },
  // Verifiers.
  {
    path: '/Verifiers/verifierLanding',
    name: 'verifierLandingPage',
    component: () => import('@/views/Verifiers/verifierLanding.vue'),
    meta: {
      requireAuth: false
    }
  },
  {
    path: '/Verifiers/inCountryVerify',
    name: 'inCountryVerification',
    component: () => import('@/views/Verifiers/inCountryVerify.vue'),
    meta: {
      requireAuth: false
    }
  },
  // Person.
  {
    path: '/Patient/patientCentre',
    name: 'patientArea',
    component: () => import('@/views/Patient/patientCentre.vue'),
    meta: {
      requireAuth: false
    }
  }
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Configure routing permissions.
router.beforeEach((to, from, next) => {
  const authToken = sessionStorage.getItem('API-HTTP-AUTHORIZATION')
  const userType = sessionStorage.getItem('USER-TYPE')

  if (to.fullPath === '/' || to.fullPath === '/WHO/login' || to.fullPath === '/Country_level/login' || to.fullPath === '/Country_level/TC/login') {
    if (authToken) {
      next({
        path: from.fullPath
      })
    } else {
      next()
    }
  } else {
    if (to.meta.requireAuth) {
      // Check if route requires login permission.
      if (authToken) {
        // Check if access_token exist locally.
        if (to.meta.userType === userType) {
          next()
        } else {
          next('/')
        }
      } else {
        // If not logged in redirect user to login page keeping state of intended route for redirection after login success.
        next('/')
      }
    } else {
      next()
    }
  }
})
export default router
