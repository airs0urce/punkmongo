import Vue from 'vue'
import VueRouter from 'vue-router'
import Database from '../views/Database.vue'
import OverviewDatabases from '../views/OverviewDatabases.vue'
import OverviewServerInfo from '../views/OverviewServerInfo.vue'
import NewCollection from '../views/NewCollection.vue'
import NewDatabase from '../views/NewDatabase.vue'
import Collection from '../views/Collection.vue'
import DeleteCollection from '../views/DeleteCollection.vue'
import DeleteDatabase from '../views/DeleteDatabase.vue'



Vue.use(VueRouter)

const routes = [{
        path: '/',
        redirect: `/overview/databases`
    },
    {
        name: 'overview-databases',
        path: '/overview/databases',
        component: OverviewDatabases
    },
    {
        name: 'overview-server-info',
        path: '/overview/server-info',
        component: OverviewServerInfo
    },
    {
        name: 'database',
        path: '/db/:dbName',
        component: Database
    },
    {
        name: 'delete-database',
        path: '/db/:dbName/delete',
        component: DeleteDatabase
    },
    {
        name: 'new-database',
        path: '/new-database',
        component: NewDatabase
    },
    {
        name: 'delete-collection',
        path: '/db/:dbName/col/:collName/delete',
        component: DeleteCollection
    },
    {
        name: 'new-collection',
        path: '/db/:dbName/new-collection',
        component: NewCollection
    },
    {
        name: 'collection-manager',
        path: '/db/:dbName/col/:collName',
        redirect: { name: 'collection-manager-query' }
    },
    {
        name: 'collection-manager-query',
        path: '/db/:dbName/col/:collName/query',
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
    scrollBehavior(to, from, savedPosition) {
        // if (['database', 'collection'].includes(to.name)) {
        // return 0;
        // } else {
        //   return savedPosition;
        // }
    }
})

export default router