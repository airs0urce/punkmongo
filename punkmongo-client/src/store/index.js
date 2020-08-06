import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import api from '../api/api'

import * as mutations from './mutations'
import * as actions from './actions'
import * as a from 'awaiting'



Vue.use(Vuex)

const defaultQueryResult = {
    error: null,
    initialLoadFinished: false,
    collectionDocumentsTotal: 0,
    resultDocumentsTotal: 0,
    explain: {},
    pageNumber: 1,
    pagesTotal: 1,
    records: [],
    recordsTimestamps: [],
}

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            paths: ['persistent']
        }),
    ],
    state: {
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
            activeCollection: null,
            queryResult: defaultQueryResult,
        },
    },
    mutations: {
        [mutations.SET_LOADING_DB](state, bool) {
            state.loadingDb = bool;
        },
        [mutations.SET_RESIZER_POSITION](state, position) {
            state.persistent.resizerPosition = position;
        },
        [mutations.SET_DB_LIST](state, dbList) {
            state.persistent.dbList = dbList;
        },
        [mutations.UPDATE_DB_STATS](state, stats) {
            for (let i = 0; i < state.persistent.dbList.length; i++) {
                if (stats.db == state.persistent.dbList[i].name) {
                    state.persistent.dbList[i].stats = stats;
                    break;
                }
            }
        },
        [mutations.SET_SERVER_INFO](state, serverInfo) {
            state.persistent.serverInfo = serverInfo;
        },

        [mutations.SET_ACTIVE_DB](state, db) {
            state.activeDb.name = db.stats.db;
            state.activeDb.stats = db.stats;
            state.activeDb.collections = db.collections.map((collection) => {
                return {
                    ...collection,
                    stats: {}
                }; // add "stats" object
            });
        },
        [mutations.SET_ACTIVE_COLLECTION](state, collName) {
            state.activeDb.activeCollection = collName;
        },
        [mutations.TOGGLE_LEFT_PANEL](state) {
            state.persistent.showLeftPanel = !state.persistent.showLeftPanel;
        },
        [mutations.SET_COLLECTIONS_STATS](state, {
            db,
            stats
        }) {
            if (db != state.activeDb.name) {
                // if by any reason we got wrong active DB 
                throw Error(`mutations.SET_COLLECTIONS_STATS: ${db} != ${state.activeDb.name}`);
            }
            for (let i = 0; i < state.activeDb.collections.length; i++) {
                state.activeDb.collections[i].stats = stats[state.activeDb.collections[i].name];
            }
        },
        [mutations.SET_COLLECTION_QUERY_RESULT](state, {collName, result}) {
            // set result
            state.activeDb.queryResult = result;

            // update collection records count
            for (let i = 0; i <  state.activeDb.collections.length; i++) {
                if (state.activeDb.collections[i].name == collName) {
                    state.activeDb.collections[i].stats.objects = result.collectionDocumentsTotal;
                }
            }
        },    
        [mutations.RESET_COLLECTION_QUERY_RESULT](state) {
            state.activeDb.queryResult = {...defaultQueryResult};
        }, 
    },
    actions: {
        [actions.ACTION_RELOAD_DB_LIST]: async ({
            commit
        }) => {
            const dbList = await api.request('listDatabases');
            commit(mutations.SET_DB_LIST, dbList);
        },
        [actions.ACTION_RELOAD_SERVER_INFO]: async ({
            commit
        }) => {
            const serverInfo = await api.request('serverInfo');
            commit(mutations.SET_SERVER_INFO, serverInfo);
        },
        [actions.ACTION_LOAD_DB]: async ({
            commit,
            state,
            dispatch
        }, dbName) => {
            commit(mutations.SET_LOADING_DB, dbName);

            api.request('getDbCollectionsStats', {
                db: dbName
            }).then(async (dbCollectionsStats) => {
                while (state.loadingDb) {
                    await a.delay(70);
                }
                // why we check this below? Because it's possible 
                // that getDbCollectionsStats request for DB_1 didn't finish and you already moved to DB_2. 
                // In this case when we don't need to apply stats from DB_1
                if (dbName == state.activeDb.name) {
                    commit(mutations.SET_COLLECTIONS_STATS, {
                        db: dbName,
                        stats: dbCollectionsStats
                    });
                }
            });

            const dbInfo = await api.request('getDatabase', {
                db: dbName
            });
            commit(mutations.SET_ACTIVE_DB, dbInfo);
            commit(mutations.SET_LOADING_DB, null);
        },
        [actions.ACTION_COLLECTION_QUERY]: async ({commit, state}, query) => {

            const response = await api.request('collectionQuery', {
                db: state.activeDb.name,
                collection: state.activeDb.activeCollection,
                query: query
            });

            if (!response.error) {
                commit(mutations.SET_COLLECTION_QUERY_RESULT, {
                    collName: state.activeDb.activeCollection,
                    result: {
                        error: null,
                        initialLoadFinished: true,
                        collectionDocumentsTotal: response.collectionDocumentsTotal,
                        resultDocumentsTotal: response.resultDocumentsTotal,
                        explain: response.explain,
                        pageNumber: response.pageNumber,
                        pagesTotal: response.pagesTotal,
                        records: response.records,
                        recordsTimestamps: response.recordsTimestamps,
                    }
                });

            } else {
                commit(mutations.SET_COLLECTION_QUERY_RESULT, {
                    collName: state.activeDb.activeCollection,
                    result: {...defaultQueryResult, error: response.error}
                });
            }

        },
    },
    modules: {

    }
});


















