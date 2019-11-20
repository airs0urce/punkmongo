<template>
  <div>
    <!-- <router-link :to="'/db/' + activeDb.name + '/col/' + activeDb.activeCollection + '/insert'">New collection</router-link> -->

    <tabs class="collection-tabs">
      <tab title="Query/Update/Delete/Distinct" class="collection-tab">
        <QueryBuilder />
        <QueryResults />
      </tab>
      <tab title="Insert" class="collection-tab" >
        Insert
      </tab>
      <tab title="Aggregate" class="collection-tab">
        Aggregate interface
      </tab>
      <tab title="Indexes" class="collection-tab">
        Indexes Management | Usage Statistics
      </tab>
      <tab title="Validation" class="collection-tab">
        Validation
      </tab>
      <tab title="Import/Export" class="collection-tab">
        Import/Export
      </tab>
      
    </tabs>
    
  </div>
</template>

<script>
  import * as a from 'awaiting';
  import QueryBuilder from '@/components/QueryBuilder';
  import QueryResults from '@/components/QueryResults';
  
  import { mapState } from 'vuex';
  import eventBus from '../eventBus'
  import * as mutations from '../store/mutations'

  export default {
    components: {
      QueryBuilder,
      QueryResults
    },
    computed: mapState({
      activeDb: state => state.activeDb,
    }),
    methods: {

    },
    mounted () {
      eventBus.$emit('load-database', this.$route.params.dbName);
      this.setActiveCollection();
    },
    watch: {
      async $route (to) {
        if (to.name.startsWith('collection-manager')) {        
          this.setActiveCollection();
        }
      }
    },
    methods: {
      setActiveCollection() {
        const collName = this.$route.params.collName;
        console.log('>>>>>collName', collName);
        this.$store.commit(mutations.SET_ACTIVE_COLLECTION, collName);
      }
    }
  }
</script>

<style lang="scss" scoped>



</style>








