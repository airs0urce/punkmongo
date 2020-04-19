<template>
  <div>
    
    <div v-if="state.persistent.dbList.length == 0">
      Loading databases...
    </div>
    <div v-if="state.persistent.dbList.length > 0">

      <router-link class="new-database" :to="'/new-database'">New database</router-link>
      <ul class="left-panel-dbs">
        <li v-for="db in state.persistent.dbList">
          <router-link 
            class="db-link loading-animation" 
            :class="{loading: showLoadingDb == db.name, 'router-link-exact-active': state.activeDb.name == db.name}"
            :to="'/db/' + db.name"
            @click.native="onDbLinkClicked(db.name)"
          >{{db.name}}</router-link>  

          ({{db.stats.collections}})

          <div v-if="state.activeDb.name == db.name">
            <ul class="left-panel-collections">
              <li v-for="collection in state.activeDb.collections">
                <router-link :to="'/db/' + state.activeDb.name + '/col/' + collection.name">{{collection.name}}</router-link> ({{numberWithCommas(collection.stats.objects)}})
              </li>
            </ul>
            <router-link class="new-collection" :to="'/db/' + state.activeDb.name + '/new-collection'">New collection</router-link>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script type="text/javascript">

import * as actions from '../store/actions'
import { mapState } from 'vuex';
import moment from 'moment';
import * as a from 'awaiting';
import eventBus from '../eventBus'
import utils from '../utils'

let dbLoadStartedTs = 0;
const loadingDbAnimationMs = 400;

export default {
  name: 'databaseNavigation',
  components: {
    
  },
  data: function() {
    return {
      showLoadingDb: false,
      lastActiveDbName: ''
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
        const tookSec = moment.now() - dbLoadStartedTs;
        if (tookSec < loadingDbAnimationMs) {
          let msDelay = loadingDbAnimationMs - tookSec;        
          await a.delay(msDelay); // let animation finish
        }
        this.showLoadingDb = false;
        this.$nextTick(() => {
          this.scrollToActiveDB();
        });
      }
    },
  },
  methods: {
    onDbLinkClicked (dbName) {
      eventBus.$emit('load-database', dbName);
    },
    scrollToActiveDB () {
      const activeDbEl = document.querySelector('.db-link.router-link-exact-active');
      if (activeDbEl) {
        if ('' === this.lastActiveDbName) {
          activeDbEl.scrollIntoView({block: 'start', behavior: 'smooth'});
        } else {
          activeDbEl.scrollIntoView({block: 'nearest'});
        }
        this.lastActiveDbName = this.$store.activeDb && this.$store.activeDb.name;
      }
    },
    numberWithCommas: utils.numberWithCommas,

  },
  mounted: async function() {
    await this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST)
  },
}
</script>

<style lang="scss" scoped>
a.new-database {
  background: url('../assets/imgs/add.png') no-repeat;
  background-size: 14px;
  background-position: 0px 0.5px;
  padding-left: 1.7em;
  padding-bottom: 0.3em;
  display: inline-block;
}
a.new-collection {
  background: url('../assets/imgs/add.png') no-repeat;
  background-size: 14px;
  background-position: 0px 0.5px;
  padding-left: 1.7em;
  padding-bottom: 0.3em;
  display: inline-block;
  margin-left: 1.6em;
}

a {
  line-height: 1.5;
}
.left-panel-dbs {
  padding-bottom: 1.5em;
  .left-panel-collections .router-link-active {
    font-weight: bold;
  }
  li {
    line-height: 1.2;
    background: url('../assets/imgs/database.png') no-repeat;
    background-size: 14px;
    background-position: 0px 0.5px;
    
    a.db-link {
      padding-left: 1.7em;
      cursor: pointer;
      &:hover {
        color: blue;
      }
    }
  }
}



ul.left-panel-collections {
  padding-left: 1.6em;
  li {
    padding-left: 1.7em;
    background: url('../assets/imgs/collection.png') no-repeat;
    background-size: 14px;
    margin-bottom: 0;
  }
}
  
.loading-animation {
  background: linear-gradient(90deg, #eeefff, #dad076);  
  background-repeat: no-repeat;
  background-size: 0 100%;
  background-position: 14px 0;
}
.loading-animation.loading {
  transition: background 0.4s ease-out; 
  background-size: 100% 100%;
}
// .loading-animation.loading {
//   transition: background 0.4s ease-out; 
//   background-size: 100%;
// }
.db-link.router-link-exact-active {
  font-weight: bold;
}  

  
</style>








