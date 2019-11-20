<template>
  <div>
    <div class="gap"></div>
    <div class="pagination">
      <div>First | 1 | 2 | 3 | 4 | 5 | Last</div>
      <div><button>Go to page</button> <input type="" name="" style="width: 4em;"></div> 
    </div>
    <div class="gap"></div>

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
export default {

}
</script>


<style lang="scss">

div.document {
  border: 2px #ccc solid;
  margin-bottom: 1em;
  &:hover {
    background-color: rgb(238, 239, 255);
  }
}
</style>