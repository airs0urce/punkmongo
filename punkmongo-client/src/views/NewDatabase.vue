<template>
    <div>
        <div class="page-header">
            New Database    
        </div>
            
        <form class="no-select">
            <div class="form-row">                
                <label class="field-name">Database Name</label>
                <input type="text" v-model="databaseName" v-shortkey="['enter']" @shortkey="createDatabase()" ref="databaseName"/>
                <div v-if="errors.databaseName" class="local-error-text">{{errors.databaseName}}</div>
                <div v-if="validating" class="local-info-text">Validating database name...</div>
                
            </div>
        </form>
        <div class="gap"></div>

    
        <button @click="createDatabase()" class="confirm-button" :disabled="validating">
            <font-awesome-icon icon="plus" />
            Create Database
        </button>
        <button @click="goBack()" :disabled="validating">
            Cancel
        </button>
        
    </div>
</template>

<script>

import api from '../api/api';

export default {
    data: function() {
        return {
            loading: false,
            validating: false,
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
                    name: 'new-collection', 
                    params: {dbName: this.databaseName}
                });

                this.databaseName = '';
                this.errors.databaseName = null;
            }
        },
        validateDbName: async function() {
            this.validating = true;
            const response = await api.request('checkCanCreateDatabase', {db: this.databaseName});
            this.validating = false;
            return response;
        },
        goBack() {
            if (this.$store.state.previosRoute) {
                this.$router.go(-1);
            } else {
                this.$router.push({ 
                    name: 'overview-databases'
                });
            }
            
        },
    },
    mounted() {
        this.$refs['databaseName'].focus();
    }
}
</script>

<style lang="scss" scoped>

</style>



