import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import createCache from 'vuex-cache';
import api from '../api'

import * as types from './mutation-types'
import * as actions from './action-types'



Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    createPersistedState({paths: ['persistent']}),
    createCache()
  ],
  state: {
    persistent: {
      resizerPosition: 200, 
      dbList: [],
      dbName: {},
      collections: []
    },
  },
  mutations: {
    [types.SET_RESIZER_POSITION] (state, position) {
      state.persistent.resizerPosition = position;
    },
    [types.SET_DB_LIST] (state, dbList) {
      state.persistent.dbList = dbList;
    },
    [types.SET_SERVER_INFO] (state, serverInfo) {
      state.persistent.serverInfo = serverInfo;
    },
    [types.SET_DB] (state, dbName) {
      state.persistent.dbName = dbName;
    },
    [types.SET_COLLECTIONS] (state, collections) {
      state.persistent.collections = collections;
    },
    
  },
  actions: {
    [actions.ACTION_RELOAD_DB_LIST]: async ({commit}) => {
      const dbList = await api.request('listDatabases');
      commit(types.SET_DB_LIST, dbList);
    },
    [actions.ACTION_RELOAD_SERVER_INFO]: async ({commit}) => {
      const serverInfo = await api.request('serverInfo');
      commit(types.SET_SERVER_INFO, serverInfo);
    },
    [actions.ACTION_LOAD_DB]: async ({ commit }, dbName) => {
      commit(types.SET_COLLECTIONS, []);
      const collectionList = await api.request('listCollections', {db: dbName});
      
      commit(types.SET_DB, dbName);
      commit(types.SET_COLLECTIONS, collectionList);
    }
  },
  modules: {

  }
})
