<template>
  <div>
    <h1>
      <div v-if="activeDb.name != ''">
        Databases » <router-link :to="`/db/${activeDb.name}`">{{activeDb.name}}</router-link> » {{activeDb.activeCollection}}
      </div>  
    </h1>
    <br/>
    

    <tabs class="collection-tabs">
      <tab title="Query/Update/Delete/Distinct" class="collection-tab">
        <RUD />
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
      <!-- 
      <tab title="Validation" class="collection-tab">
        Validation
      </tab>
      <tab title="Import/Export" class="collection-tab">
        Import/Export
      </tab> 
      Changestreams
      -->
      
    </tabs>
    
  </div>
</template>

<script>
  import * as a from 'awaiting';
  import RUD from '@/components/RUD';
  
  import { mapState } from 'vuex';
  import eventBus from '../eventBus'
  import * as mutations from '../store/mutations'

  export default {
    components: {
      RUD,
    },
    computed: mapState({
      activeDb: state => state.activeDb,
    }),
    methods: {

    },
    mounted () {

      if (this.$route.params.dbName !== this.$store.state.activeDb.name) {
        eventBus.$emit('load-database', this.$route.params.dbName);
      }
      
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
        this.$store.commit(mutations.SET_ACTIVE_COLLECTION, collName);
      }
    }
  }
</script>

<style lang="scss" scoped>



</style>








