<template>
  <div>
    Database view
  </div>
</template>

<script>
  
import * as actions from '../store/actions'
import moment from 'moment';
import * as a from 'awaiting';
import eventBus from '../eventBus'




export default {
  name: 'OverviewDatabases',
  mounted () {
    eventBus.$on('load-database', async (dbName) => {
      this.loadDatabase(dbName);
    });
  },
  components: {
    
  },
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
    }
  },
  mounted() {
    this.loadDatabase(this.$route.params.dbName);
  }
}
</script>