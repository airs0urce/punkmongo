import Vue from 'vue'
import VueRouter from 'vue-router'
import Database from '../views/Database.vue'
import Collection from '../views/Collection.vue'
import Overview from '../views/Overview.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: `/overview/databases`
  },
  {
    name: 'overview-databases',
    path: '/overview/databases',
    component: Overview
  },
  {
    name: 'overview-server-info',
    path: '/overview/server-info',
    component: Overview
  },
  {
    name: 'database',
    path: '/database/:dbName',
    component: Database
  },
  {
    name: 'collection',
    path: '/database/:dbName/collection/:collName',
    component: Collection
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
