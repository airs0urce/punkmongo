import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import api from '../api/api'

import * as mutations from './mutations'
import * as actions from './actions'



Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    createPersistedState({paths: ['persistent']}),
  ],
  state: {
    persistent: {
      resizerPosition: 200, 
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
    }
  },
  mutations: {
    [mutations.SET_LOADING_DB] (state, bool) {
      state.loadingDb = bool;
    },
    [mutations.SET_RESIZER_POSITION] (state, position) {
      state.persistent.resizerPosition = position;
    },
    [mutations.SET_DB_LIST] (state, dbList) {
      state.persistent.dbList = dbList;
    },
    [mutations.UPDATE_DB_STATS] (state, stats) {
      for (let i = 0; i < state.persistent.dbList.length; i++) {
        if (stats.db == state.persistent.dbList[i].name) {
          state.persistent.dbList[i].stats = stats;
          break;
        }
      }
    },
    [mutations.SET_SERVER_INFO] (state, serverInfo) {
      state.persistent.serverInfo = serverInfo;
    },

    [mutations.SET_ACTIVE_DB] (state, db) {
      state.activeDb.name = db.stats.db;
      state.activeDb.stats = db.stats;
      state.activeDb.collections = db.collections;
    },
    [mutations.SET_ACTIVE_COLLECTION] (state, collName) {
      state.activeDb.activeCollection = collName;
    },
    [mutations.TOGGLE_LEFT_PANEL] (state) {
      state.persistent.showLeftPanel = ! state.persistent.showLeftPanel;
    },
    
  },
  actions: {
    [actions.ACTION_RELOAD_DB_LIST]: async ({commit}) => {
      const dbList = await api.request('listDatabases');
      commit(mutations.SET_DB_LIST, dbList);
    },
    [actions.ACTION_RELOAD_SERVER_INFO]: async ({commit}) => {
      const serverInfo = await api.request('serverInfo');
      commit(mutations.SET_SERVER_INFO, serverInfo);
    },
    [actions.ACTION_LOAD_DB]: async ({ commit }, dbName) => {
      commit(mutations.SET_LOADING_DB, dbName);
      const dbnfo = await api.request('getDatabase', {db: dbName});
      commit(mutations.SET_ACTIVE_DB, dbnfo);
      commit(mutations.SET_LOADING_DB, null);
    }
  },
  modules: {

  }
})










