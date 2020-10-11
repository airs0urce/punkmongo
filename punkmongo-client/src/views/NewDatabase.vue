<template>
    <div>
        <div class="page-header">
            New Database    
        </div>
            
        <form class="no-select">
            <div class="form-row">                
                <label class="field-name">Name</label>
                <input type="text" v-model="databaseName" ref="test"/>
                <div v-if="errors.databaseName" class="local-error-text inline">{{errors.databaseName}}</div>
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
            errors: {
                databaseName: ''
            }
        };
    },
    methods: {
        createDatabase: async function() {
            this.errors.databaseName = null;

            const dbName = this.$store.state.activeDb.name;
            const validateNameRes = await this.validateDbName(dbName);
            
            if (!validateNameRes.result.canCreate) {
                this.errors.databaseName = validateNameRes.result.reason
            } else {
                this.databaseName = '';
                this.errors.databaseName = null;
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



