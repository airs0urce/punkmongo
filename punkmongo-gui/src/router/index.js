import Vue from 'vue'
import VueRouter from 'vue-router'
import OverviewDatabases from '../views/OverviewDatabases.vue'
import ServerInfo from '../views/ServerInfo.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: `/overview/databases`
  },
  {
    path: '/overview/databases',
    component: OverviewDatabases
  },
  {
    path: '/overview/server-info',
    component: ServerInfo
  },
  
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})

export default router
