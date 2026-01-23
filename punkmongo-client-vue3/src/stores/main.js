import { defineStore } from 'pinia'
import api from '../api/api'
import { delay } from '../utils'

const defaultQueryResult = {
    error: null,
    initialLoadFinished: false,
    collectionDocumentsTotal: 0,
    resultDocumentsTotal: 0,
    explain: {},
    pageNumber: 1,
    pagesTotal: 1,
    records: [],
}

export const useMainStore = defineStore('main', {
    state: () => ({
        persistent: {
            resizerPosition: 260,
            dbList: [],
            serverInfo: {},
            showLeftPanel: true
        },
        loadingDb: null,
        activeDb: {
            name: '',
            stats: {},
            collections: [],
            activeCollection: { name: '', indexes: [] },
            queryResult: { ...defaultQueryResult },
        },
        errors: {
            server_uncaught: null,
        },
        previosRoute: null
    }),

    actions: {
        setLoadingDb(bool) {
            this.loadingDb = bool
        },

        setResizerPosition(position) {
            this.persistent.resizerPosition = position
        },

        setDbList(dbList) {
            this.persistent.dbList = dbList
        },

        updateDbStats(stats) {
            for (let i = 0; i < this.persistent.dbList.length; i++) {
                if (stats.db == this.persistent.dbList[i].name) {
                    this.persistent.dbList[i].stats = stats
                    break
                }
            }
        },

        setServerInfo(serverInfo) {
            this.persistent.serverInfo = serverInfo
        },

        setActiveDb(db) {
            this.activeDb.name = db.stats.db
            this.activeDb.stats = db.stats
            this.activeDb.collections = db.collections.map((collection) => {
                return {
                    ...collection,
                    stats: {}
                }
            })
        },

        setActiveCollection(collName) {
            this.activeDb.activeCollection.name = collName
        },

        toggleLeftPanel() {
            this.persistent.showLeftPanel = !this.persistent.showLeftPanel
        },

        setCollectionsStats({ db, stats }) {
            if (db != this.activeDb.name) {
                throw Error(`setCollectionsStats: ${db} != ${this.activeDb.name}`)
            }
            for (let i = 0; i < this.activeDb.collections.length; i++) {
                this.activeDb.collections[i].stats = stats[this.activeDb.collections[i].name]
            }
        },

        setCollectionQueryResult({ collName, result }) {
            this.activeDb.queryResult = result

            for (let i = 0; i < this.activeDb.collections.length; i++) {
                if (this.activeDb.collections[i].name == collName) {
                    this.activeDb.collections[i].stats.objects = result.collectionDocumentsTotal
                }
            }
        },

        resetCollectionQueryResult() {
            this.activeDb.queryResult = { ...defaultQueryResult }
        },

        setCollectionIndexes(indexes) {
            this.activeDb.activeCollection.indexes = indexes
        },

        setUncaughtServerError({ error }) {
            this.errors['server_uncaught'] = error
        },

        setPreviousRoute(route) {
            this.previosRoute = route
        },

        // Async actions
        async reloadDbList() {
            const response = await api.request('listDatabases')
            if (!response.error) {
                this.setDbList(response.result)
            }
        },

        async reloadServerInfo() {
            const response = await api.request('serverInfo')
            if (!response.error) {
                this.setServerInfo(response.result)
            }
        },

        async loadDb(dbName) {
            this.setLoadingDb(dbName)

            api.request('getDbCollectionsStats', {
                db: dbName
            }).then(async (response) => {
                while (this.loadingDb) {
                    await delay(70)
                }
                if (dbName == this.activeDb.name) {
                    if (!response.error) {
                        this.setCollectionsStats({
                            db: dbName,
                            stats: response.result
                        })
                    }
                }
            })

            const response = await api.request('getDatabase', { db: dbName })
            if (!response.error) {
                this.setActiveDb(response.result)
            }
            this.setLoadingDb(null)
        },
    },

    persist: {
        paths: ['persistent'],
    },
})
