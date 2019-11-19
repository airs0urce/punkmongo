<template>
  <div>
    <div v-if="activeDb.name == ''">
      Loading...
    </div>
    <div v-if="activeDb.name != ''">
      Databases » {{activeDb.name}}
      <div class="line" />
      Statistics | New Collection | Command | 

      <div class="line" />
      

      <table cellpadding="2" cellspacing="1">
        <colgroup>
          <col width="300" valign="top">
          <col width="100" valign="top">
          <col width="100" valign="top">
          <col width="100" valign="top">
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
            <td>Avg Object Size</td>
            <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'KB') }}</td>
            <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'MB') }}</td>
            <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'GB') }}</td>
          </tr>
          <tr>
            <td>Collections</td>
            <td colspan="3">{{activeDb.collections.length}}</td>
          </tr>
          <tr>
            <td>Documents</td>
            <td colspan="3">{{ numberWithCommas(activeDb.stats.objects) }}</td>
          </tr>
          <tr>
            <td>Indexes</td>
            <td colspan="3">{{ activeDb.stats.indexes }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="gap"></div>

      <table cellpadding="2" cellspacing="1">
        <colgroup>
          <col width="400" valign="top">
          <col width="200" valign="top">
        </colgroup>
        <thead>
          <tr>
            <th>Collections ({{activeDb.collections.length}})</th>
            <th>Documents</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="collection in activeDb.collections">
            <td>
              <router-link :to="'/database/' + activeDb.name + '/collection/' + collection.name">{{collection.name}}</router-link>  
            </td>
            <td>
              {{numberWithCommas(collection.count)}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
  components: {
    
  },
  computed: mapState({
    activeDb: state => state.activeDb,
  }),
  watch: {
    async $route (to) {
      if ('database' == to.name) {        
        eventBus.$emit('load-database', this.$route.params.dbName);
      }
    }
  },
  methods: {
    bytesFormatted: utils.bytesFormatted,
    numberWithCommas: utils.numberWithCommas,
  },
}
</script>