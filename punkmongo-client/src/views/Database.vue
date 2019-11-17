<template>
  <div>
    Testimg
  </div>
</template>

<script>
  
import * as actions from '../store/actions'
import moment from 'moment';
import * as a from 'awaiting';
import eventBus from '../eventBus'




export default {
  name: 'OverviewDatabases',
  created () {
    eventBus.$on('load-database', async (dbName) => {
      this.loadDatabase(dbName);
    });
  },
  components: {
    
  },
  watch: {
    async $route (to) {
      if ('database' == to.name) {
        const dbName = this.$route.params.dbName;  
        this.loadDatabase(dbName);
      }
    }
  },
  methods: {
    async loadDatabase(dbName) {
      this.$store.state.loadingDb = dbName;
      await this.$store.dispatch(actions.ACTION_LOAD_DB, dbName);
      this.$store.state.loadingDb = null;
    }
  },
}
</script>