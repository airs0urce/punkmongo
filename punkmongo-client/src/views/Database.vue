<template>
  <div>
    Databases » {{activeDb.name}}
    <div class="line" />
    Statistics | New Collection | Command | 

    <div class="line" />
    {{activeDb}}
    <table cellpadding="2" cellspacing="1" class="sortable">
      <colgroup>
        <col width="200" valign="top">
        <col width="110" valign="top">
        <col width="90" valign="top">
        <col width="110" valign="top">
        <col width="110" valign="top">
        <col width="90" valign="top">
      </colgroup>
      <thead>
        <tr>
          <th coolspan="2">Database Statistics</th>
        </tr>
      </thead>
      <tbody>
        <!-- <tr>
          <th>Objects</th>
          <td>{{ numberWithCommas(activeDb.stats.objects) }}</td>
        </tr>
        <tr>
          <th>Avg Object Size</th>
          <td>{{ numberWithCommas(activeDb.stats.avgObjSize) }}</td>
        </tr> -->
        <tr>
          <th>Data Size</th>
          <td></td>
        </tr>
        <tr>
          <th>Storage Size</th>
          <td></td>
        </tr>
        <tr>
          <th>Extents</th>
          <td></td>
        </tr>
        <tr>
          <th>Indexes</th>
          <td></td>
        </tr>
        <tr>
          <th>Index Size</th>
          <td></td>
        </tr>
        <tr>
          <th>Collections</th>
          <td></td>
        </tr>
        
        <!-- <tr v-for="db in this.$store.state.persistent.dbList">
          <td>
            <router-link :to="'/database/' + db.name" >{{db.name}}</router-link>  
          </td>
          <td>{{db.stats.collections}}</td>
          <td>{{db.stats.indexes}}</td>
          <td>{{bytesFormatted(db.stats.storageSize)}}</td>
          <td>{{bytesFormatted(db.stats.indexSize)}}</td>
          <td>{{numberWithCommas(db.stats.objects)}}</td>
        </tr> -->
      </tbody>
    </table>
    



  </div>
</template>

<script>
  
import * as actions from '../store/actions'
import moment from 'moment';
import * as a from 'awaiting';
import eventBus from '../eventBus'
import { mapState } from 'vuex';
import utils from '../utils'


export default {
  name: 'OverviewDatabases',
  mounted () {
    eventBus.$on('load-database', async (dbName) => {
      this.loadDatabase(dbName);
    });
  },
  components: {
    
  },
  computed: mapState({
    activeDb: state => state.activeDb,
  }),
  watch: {
    async $route (to) {
      if ('database' == to.name) {        
        this.loadDatabase(this.$route.params.dbName);
      }
    }
  },
  methods: {
    async loadDatabase(dbName) {
      if (this.$store.state.loadingDb == dbName) {
        return;
      }
      this.$store.state.loadingDb = dbName;
      await this.$store.dispatch(actions.ACTION_LOAD_DB, dbName);
      this.$store.state.loadingDb = null;
    },
    bytesFormatted: utils.bytesFormatted,
    numberWithCommas: utils.numberWithCommas,
  },
  mounted() {
    this.loadDatabase(this.$route.params.dbName);
  }
}
</script>