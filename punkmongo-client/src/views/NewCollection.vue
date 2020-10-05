<template>
    <div>
        <div class="page-header">
            <router-link :to="`/db/${$store.state.activeDb.name}`">{{$store.state.activeDb.name}}</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            New Collection    
        </div>
            

        <label class="form">Name</label>

        

        <table cellpadding="2" cellspacing="1" width="400">
            <colgroup>
                <col width="20%" valign="top">
                <col width="80%" valign="top">
            </colgroup>
            <thead>
                <tr>
                    <th colspan="2">New Collection</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Name</td>
                    <td>
                        <input type="" name="" />
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <input type="checkbox" id="capped-collection" /> 
                        <label for="capped-collection">Capped Collection</label>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <input type="checkbox">
                        <label>Use Custom Collation</label>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>

export default {
  
}
</script>

<style lang="scss" scoped>

</style>