<template>
    <div>
        <div class="page-header">
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
            <div class="form-row">
                <label><input type="checkbox" /> Use Custom Collation</label>
            </div>
            <div class="form-row form-row-last">
                <button>Create Collection</button>
            </div>
        </form>
        

    
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
    .field-name {
        margin-bottom: 0.3em;
    }
</style>