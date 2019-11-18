<template>
  <div>
    Databases » {{activeDb.name}}
    <div class="line" />
    Statistics | New Collection | Command | 

    <div class="line" />
    

    <table cellpadding="2" cellspacing="1">
      <colgroup>
        <col width="150" valign="top">
        <col width="110" valign="top">
        <col width="90" valign="top">
        <col width="110" valign="top">
      </colgroup>
      <thead>
        <tr>
          <th>Database Statistics</th>
          <th>KB</th>
          <th>MB</th>
          <th>GB</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Avg Object Size</td>
          <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'KB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'MB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'GB') }}</td>
        </tr>
        <tr>
          <td>Data Size</td>
          <td>{{ bytesFormatted(activeDb.stats.dataSize, 'KB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.dataSize, 'MB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.dataSize, 'GB') }}</td>
        </tr>
        <tr>
          <td>Storage Size</td>
          <td>{{ bytesFormatted(activeDb.stats.storageSize, 'KB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.storageSize, 'MB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.storageSize, 'GB') }}</td>
        </tr>
        
        <tr>
          <td>Index Size</td>
          <td>{{ bytesFormatted(activeDb.stats.indexSize, 'KB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.indexSize, 'MB') }}</td>
          <td>{{ bytesFormatted(activeDb.stats.indexSize, 'GB') }}</td>
        </tr>
        <tr>
          <td>Objects</td>
          <td colspan="3">{{ numberWithCommas(activeDb.stats.objects) }}</td>
        </tr>
        <tr>
          <td>Indexes</td>
          <td colspan="3">{{ activeDb.stats.indexes }}</td>
        </tr>
        <tr>
          <td>Collections</td>
          <td colspan="3">{{activeDb.collections.length}}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="gap"></div>

    <table cellpadding="2" cellspacing="1">
      <colgroup>
        <col width="463" valign="top">
      </colgroup>
      <thead>
        <tr>
          <th>Collections</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="collection in activeDb.collections">
          <td>
            <router-link :to="'/database/' + activeDb.name + '/collection/' + collection">{{collection}}</router-link>  
          </td>
        </tr>
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
    this.loadDatabase(this.$route.params.dbName);
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
}
</script>