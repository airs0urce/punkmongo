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
    path: '/db/:dbName',
    component: Database
  },
  {
    name: 'collection-manager',
    path: '/db/:dbName/col/:collName',
    component: Collection
  },
  {
    name: 'collection-manager-crud',
    path: '/db/:dbName/col/:collName/crud',
    component: Collection
  },
  {
    name: 'collection-manager-insert',
    path: '/db/:dbName/col/:collName/insert',
    component: Collection
  },
  {
    name: 'collection-manager-aggregate',
    path: '/db/:dbName/col/:collName/aggregate',
    component: Collection
  },
  {
    name: 'collection-manager-indexes',
    path: '/db/:dbName/col/:collName/indexes',
    component: Collection
  },
  {
    name: 'collection-manager-validation',
    path: '/db/:dbName/col/:collName/validation',
    component: Collection
  },
  {
    path: '*',
    component: () => import('../views/404.vue')
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
  routes,
  scrollBehavior (to, from, savedPosition) {
    // if (['database', 'collection'].includes(to.name)) {
      // return 0;
    // } else {
    //   return savedPosition;
    // }
  }
})

export default router
