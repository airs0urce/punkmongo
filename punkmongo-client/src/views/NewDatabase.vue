<template>
    <div>
        <div class="page-header">
            New Database    
        </div>
            
        <form class="no-select">
            <div class="form-row">
                <div>
                    <label class="field-name">Name</label>
                    <input type="text" v-model="databaseName" ref="test"/>
                </div>
                <div v-if="error" class="local-error top-gap">{{error}}</div>
            </div>
        </form>
        <div class="gap"></div>

    
        <button @click="createDatabase()">Create Database</button>
        
    </div>
</template>

<script>

import api from '../api/api';

export default {
    data: function() {
        return {
            databaseName: '',
            error: null
        };
    },
    methods: {
        createDatabase: async function() {
            this.error = null;

            const dbName = this.$store.state.activeDb.name;
            const validateNameRes = await this.validateDbName(dbName);
            
            if (!validateNameRes.result.canCreate) {
                this.error = validateNameRes.result.reason
            } else {
                this.databaseName = '';
                this.error = null;
                this.$router.push({
                    name: 'new_collection', 
                    params: {dbName: dbName}
                });
            }
        },
        validateDbName: async function() {
            const response = await api.request('checkCanCreateDatabase', {dbName: this.databaseName});
            return response;
        }
    }
}
</script>

<style lang="scss" scoped>

</style>



