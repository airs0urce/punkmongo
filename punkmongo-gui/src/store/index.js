import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import createCache from 'vuex-cache';

import { SET_RESIZER_POSITION } from './mutation-types'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    createPersistedState({paths: ['persistent']}),
    createCache()
  ],
  state: {
    persistent: {resizerPosition: 200},
  },
  mutations: {
    [SET_RESIZER_POSITION] (state, position) {
      state.persistent.resizerPosition = position;
    }
  },
  actions: {

  },
  modules: {

  }
})
