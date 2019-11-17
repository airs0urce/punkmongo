<template>
  <div>
    <ul class="left-panel-dbs">
      <li v-for="db in this.$store.state.persistent.dbList" @click="selectDatabase(db.name)">
        <a href="#" class="db-link" :class="{active: $store.state.persistent.dbName == db.name}">{{db.name}}</a> ({{db.stats.collections}})
        <ul class="left-panel-collections" v-show="$store.state.persistent.dbName == db.name">
          <li v-for="collection in $store.state.persistent.collections">{{collection}}</li>
          
        </ul>
      </li>
    </ul>
  </div>
</template>

<script type="text/javascript">

import * as types from '../store/mutation-types'
import * as actions from '../store/action-types'


export default {
  name: 'databaseNavigation',
  components: {
    
  },
  mounted: async function() {
    this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);
  },
  methods: {
    selectDatabase (dbName) {
      this.$store.dispatch(actions.ACTION_LOAD_DB, dbName);
    },

  }
}
</script>

<style type="text/css">
  .left-panel-dbs {
    padding-bottom: 1.5em;
  }
  .left-panel-dbs li {
    padding-left: 1.7em;
    background: url('../assets/imgs/database.png') no-repeat;
    background-size: 14px;
    background-position: 0px 0.5px;
    cursor: pointer;
  }

  .left-panel-dbs li:hover a {
    color: blue;
  }

  ul.left-panel-collections {
    padding-left: 0.1em;
  }
  ul.left-panel-collections li {
    padding-left: 1.4em;
    background: url('../assets/imgs/collection.png') no-repeat;
    background-size: contain;
    cursor: pointer;
    margin-bottom: 0.4em;
  }

  a.db-link.active {
    font-weight: bold;
  }
</style>








