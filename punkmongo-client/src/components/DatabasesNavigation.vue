<template>
  <div>
    <ul class="left-panel-dbs">
      <li v-for="db in this.$store.state.persistent.dbList"><a href="#">{{db.name}}</a> ({{db.stats.collections}})</li>
    </ul>
  </div>
</template>

<script type="text/javascript">

import * as actions from '../store/action-types'

export default {
  name: 'databaseNavigation',
  components: {
    
  },
  mounted: async function() {
    this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);
    
  }
}
</script>

<style type="text/css">
  .left-panel-dbs {
    padding-bottom: 1.5em;
  }
  .left-panel-dbs li {
    padding-left: 1.7em;
    background: url('../assets/imgs/database.png') no-repeat;
    background-size: 14px;
    background-position: 0px 0.5px;
    cursor: pointer;
  }

  .left-panel-dbs li:hover a {
    color: blue;
  }

</style>








