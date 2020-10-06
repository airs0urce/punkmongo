<template>
    <div>
        <div class="page-header">
            <router-link :to="`/overview/databases`">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            <router-link :to="`/db/${$store.state.activeDb.name}`">{{$store.state.activeDb.name}}</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            
            New Collection
        </div>
            

        <form class="no-select">
            <div class="form-row">
                <label class="field-name">Name</label>
                <input type="text" ref="test"/>
            </div>
            <div class="form-row">
                <label><input type="checkbox" /> Capped Collection</label>
            </div>
            <div class="form-row-padding">
                <label class="field-name" for="max-docs-num">Max number of documents:</label>
                <input type="text" id="max-docs-num" />
            </div>
            <div class="form-row-padding">
                <label class="field-name" for="max-size">Max size:</label>
                <input type="text" id="max-size" /> MB
            </div>

            <div class="form-row">
                <label><input type="checkbox" /> Use Custom Collation</label>
            </div>
            
        </form>
        <div class="gap"></div>
        <button>Create Collection</button>
        

    
    </div>
</template>

<script>

export default {
    mounted() {
        this.$refs['test'].focus();
    }
}
</script>

<style lang="scss" scoped>
    
</style>