<template>
  <div>
    {{activeDb.name}} -> 

    <tabs class="collection-tabs">
      <tab title="Query/Update/Delete" class="collection-tab">
        <QueryBuilder />
      </tab>
      <tab title="Insert" class="collection-tab">
        Insert
      </tab>
      <tab title="Aggregate" class="collection-tab">
        Aggregate interface
      </tab>
      <tab title="Distinct" class="collection-tab">
        Distinct interface
      </tab>
    </tabs>

    


    <div class="document">
      Update | Delete | Refresh | Expand | Expand All
    </div>
    <div class="document">
      Update | Delete | Refresh | Expand | Expand All
    </div>
    <div class="document">
      Update | Delete | Refresh | Expand | Expand All
    </div>
    
  </div>
</template>

<script>
  import * as a from 'awaiting';
  import QueryBuilder from '@/components/QueryBuilder';
  import { mapState } from 'vuex';
  import eventBus from '../eventBus'

  export default {
    components: {
      QueryBuilder,
    },
    computed: mapState({
      activeDb: state => state.activeDb,
    }),
    methods: {

    },
    mounted () {
      eventBus.$emit('load-database', this.$route.params.dbName);

    },
  }
</script>

<style lang="scss" scoped>

div.document {
  border: 2px #ccc solid;
  margin-bottom: 1em;
  &:hover {
    background-color: rgb(238, 239, 255);
  }
}
.collection-tab {
  background-color: rgb(238, 239, 255);
  padding: 1em 0.4em 0.4em;
  position: relative;
}
</style>








