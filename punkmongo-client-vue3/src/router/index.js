import { createRouter, createWebHistory } from 'vue-router'
import Database from '../views/Database.vue'
import OverviewDatabases from '../views/OverviewDatabases.vue'
import OverviewServerInfo from '../views/OverviewServerInfo.vue'
import NewCollection from '../views/NewCollection.vue'
import NewDatabase from '../views/NewDatabase.vue'
import Collection from '../views/Collection.vue'
import DropCollection from '../views/DropCollection.vue'
import RenameCollection from '../views/RenameCollection.vue'
import DropDatabase from '../views/DropDatabase.vue'

const routes = [
    {
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
        name: 'drop-database',
        path: '/db/:dbName/delete',
        component: DropDatabase
    },
    {
        name: 'new-database',
        path: '/new-database',
        component: NewDatabase
    },
    {
        name: 'drop-collection',
        path: '/db/:dbName/col/:collName/drop',
        component: DropCollection
    },
    {
        name: 'rename-collection',
        path: '/db/:dbName/col/:collName/rename',
        component: RenameCollection
    },
    {
        name: 'new-collection',
        path: '/db/:dbName/new-collection',
        component: NewCollection
    },
    {
        name: 'collection-manager',
        path: '/db/:dbName/col/:collName',
        redirect: to => ({ name: 'collection-manager-query', params: to.params })
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
        path: '/:pathMatch(.*)*',
        component: () => import('../views/404.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // Return undefined for default behavior
    }
})

export default router
