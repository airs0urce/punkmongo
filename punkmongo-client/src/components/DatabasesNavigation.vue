<template>
  <div>
    <ul class="left-panel-dbs">
      <li v-for="db in state.persistent.dbList">
        <router-link 
          class="db-link loading-animation" 
          :class="{loading: showLoadingDb == db.name, 'router-link-exact-active': state.activeDb.name == db.name}"
          :to="'/database/' + db.name"
          @click.native="onDbLinkClicked(db.name)"
        >{{db.name}}</router-link>  
        ({{db.stats.collections}})
        <ul class="left-panel-collections" v-show="state.activeDb.name == db.name">
          <li v-for="collection in state.activeDb.collections">{{collection}}</li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script type="text/javascript">

import * as actions from '../store/actions'
import { mapState } from 'vuex';
import moment from 'moment';
import * as a from 'awaiting';
import eventBus from '../eventBus'

let dbLoadStartedTs = 0;
const loadingDbAnimationMs = 400;

export default {
  name: 'databaseNavigation',
  components: {
    
  },
  data: function() {
    return {
      showLoadingDb: false
    }
  },
  computed: mapState({
    state: state => state,
    loadingDb: state => state.loadingDb,
  }),
  watch: {
    async loadingDb (loadingDB) {
      dbLoadStartedTs = moment.now();
      if (loadingDB) {
        this.showLoadingDb = loadingDB;
      } else {
        await a.delay(500);
        
        const tookSec = moment.now() - dbLoadStartedTs;
        if (tookSec < loadingDbAnimationMs) {
          let msDelay = loadingDbAnimationMs - tookSec;        
          await a.delay(msDelay); // let animation finish
        }
        this.showLoadingDb = false;
      }
    }
  },
  methods: {
    onDbLinkClicked (dbName) {
      eventBus.$emit('load-database', dbName);
    }
  },
  mounted: async function() {
    this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);
  },
}
</script>

<style lang="scss">
.left-panel-dbs {
  padding-bottom: 1.5em;
}
.left-panel-dbs li {
  padding-left: 1.7em;
  background: url('../assets/imgs/database.png') no-repeat;
  background-size: 14px;
  background-position: 0px 0.5px;
  
  a.db-link {
    cursor: pointer;
    &:hover {
      color: blue;
    }
  }
}


ul.left-panel-collections {
  padding-left: 0.1em;
  li {
    padding-left: 1.4em;
    background: url('../assets/imgs/collection.png') no-repeat;
    background-size: contain;
    margin-bottom: 0.4em;
  }
}
  
.loading-animation {
  background: linear-gradient(90deg, transparent, #dad076);  
  background-repeat: no-repeat;
  background-size: 0;
}
.loading-animation.loading {
  transition: background 0.4s ease-out; 
  background-size: 100%;
}
// .loading-animation.loading {
//   transition: background 0.4s ease-out; 
//   background-size: 100%;
// }
.db-link.router-link-exact-active {
  font-weight: bold;
}  
  
</style>








