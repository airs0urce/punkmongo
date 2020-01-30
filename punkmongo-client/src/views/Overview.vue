<template>
  <div>
    <ul class="x">
      <li><router-link to="/overview/databases">All Databases</router-link></li>
      <li><router-link to="/overview/server-info">Server info</router-link></li>
    </ul>
    <div class="line" />

    
    <OverviewDatabases v-if="subpage == 'databases'" />
    <OverviewServerInfo v-if="subpage == 'server-info'" />
  </div>
</template>

<script>
import OverviewDatabases from '../views/OverviewDatabases.vue'
import OverviewServerInfo from '../views/OverviewServerInfo.vue'

export default {
  name: 'Overview',
  components: {
    OverviewDatabases,
    OverviewServerInfo
  },
  computed: {
    subpage () {
      const subpage = this.$route.path.replace('/overview/', '');
      return subpage;
    }
  }
}
</script>

<style lang="scss" scoped>
ul.x {
  display: flex;
  li {
    margin-right: 0.5rem;
    border-right: 1px solid #ddd;
    padding: 0.4rem 0.5rem;
  }
}
.router-link-exact-active {
  font-weight: bold;
}
</style>