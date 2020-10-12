<template>
    <div>
        <div class="page-header">
            New Database    
        </div>
            
        <form class="no-select">
            <div class="form-row">                
                <label class="field-name">Database Name</label>
                <input type="text" v-model="databaseName" v-shortkey="['enter']" @shortkey="createDatabase()" ref="databaseName"/>
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

            const validateNameRes = await this.validateDbName(this.databaseName);
            
            if (!validateNameRes.result.canCreate) {
                this.errors.databaseName = validateNameRes.result.reason
            } else {
                this.$router.push({
                    name: 'new_collection', 
                    params: {dbName: this.databaseName}
                });

                this.databaseName = '';
                this.errors.databaseName = null;
            }
        },
        validateDbName: async function() {
            const response = await api.request('checkCanCreateDatabase', {db: this.databaseName});
            return response;
        }
    },
    mounted() {
        this.$refs['databaseName'].focus();
    }
}
</script>

<style lang="scss" scoped>

</style>



