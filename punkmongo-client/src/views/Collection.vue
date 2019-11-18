<template>
  <div>
    Collection view

    <ul>
      <li><router-link to="">Query</router-link></li>
      <li><router-link to="">Aggregate</router-link></li>
      <li><router-link to="">Update</router-link></li>
      <li><router-link to="">Delete</router-link></li>
    </ul>

    <QueryBuilder />


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
  
  import * as queryParser from 'mongodb-query-parser'

  export default {
    components: {
      QueryBuilder,
    },
    methods: {

    }
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
  
</style>








