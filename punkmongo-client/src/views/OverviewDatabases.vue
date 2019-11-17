<template>
  <div>
    
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
          <th>Database name</th>
          <th>Collections</th>
          <th>Indexes</th>
          <th>Storage Size</th>
          <th>Indexes Size</th>
          <th>Documents</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="db in this.$store.state.persistent.dbList">
          <td>{{db.name}}</td>
          <td>{{db.stats.collections}}</td>
          <td>{{db.stats.indexes}}</td>
          <td>{{bytesFormatted(db.stats.storageSize)}}</td>
          <td>{{bytesFormatted(db.stats.indexSize)}}</td>
          <td>{{db.stats.objects}}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>TATAL</td>
          <td>{{ statsTotal('collections') }}</td>
          <td>{{ statsTotal('indexes') }}</td>
          <td>{{ bytesFormatted(statsTotal('storageSize')) }}</td>
          <td>{{ bytesFormatted(statsTotal('indexSize')) }}</td>
          <td>{{ statsTotal('objects') }}</td>
        </tr>
      </tfoot>
      
    </table>


  </div>
</template>

<script>

import * as actions from '../store/action-types'

export default {
  name: 'OverviewDatabases',
  components: {
    
  },
  mounted: async function() {
    this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);
  },
  methods: {
    statsTotal(field) {
      let total = 0;
      const dbList = this.$store.state.persistent.dbList;
      for (let db of dbList) {
        total += db.stats[field];
      }
      return total;
    },
    bytesFormatted(bytes) {
      if (bytes <= 1073741824) { // less than 1GB
        // show in MB
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
      } else if (bytes <= 1099511627776) { // less than 1TB
        // show in GB
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
      } else {
        // show in TB
        return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(2)  + ' TB';
      }
    }
  },
}
</script>





