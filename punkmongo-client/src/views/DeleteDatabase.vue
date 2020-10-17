<template>
    <div>
        <div class="page-header">
            <router-link :to="`/overview/databases`">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            <router-link :to="`/db/${dbName}`">{{dbName}}</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />Delete Database
        </div>


        <form class="no-select">
            <div class="form-row">
                <div class="field-name">
                    <label for="delete-db-name">To delete </label><strong class="with-select">{{dbName}}</strong><label for="delete-db-name"> type the database name </label><strong class="with-select">{{dbName}}</strong>:    
                </div>
                <input type="text" v-model.trim="databaseName" ref="databaseName" id="delete-db-name" />
                <div v-if="errors.databaseName" class="local-error-text">{{errors.databaseName}}</div>
            </div>
        </form>        
        <div class="gap"></div>
        <button @click="deleteDatabase()" class="btn-red" :disabled="loading">
            <font-awesome-icon icon="trash-alt" /> Delete Database
        </button>
        

    </div>
</template>

<script>
import api from '../api/api'
import eventBus from '../eventBus'
import * as actions from '../store/actions'
import * as a from 'awaiting';

export default {
    data: function() {
        return {
            databaseName: '',
            loading: false,
            errors: {
                databaseName: null,
            },
            // validating: false,
        }
    },
    computed: {
        dbName() {
            return this.$route.params.dbName;
        }

    },
    mounted() {
        this.$refs['databaseName'].focus();
    },
    methods: {
        async deleteDatabase() {
            this.errors.databaseName = '';
            if (this.databaseName == '') {
                this.errors.databaseName = `Please enter database name`;
                return;
            }
            if (this.databaseName != this.dbName) {
                this.errors.databaseName = `The entered name doesn't match database name`;
                return;
            }

            this.loading = true;
            const response = await api.request('deleteDatabase', {db: this.dbName});
            
            if (response.success) {
                await this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);

                this.$router.push({
                    name: 'overview-databases', 
                    params: {}
                });
                this.databaseName = '';
            }
            this.loading = false;

        }
    }
}



</script>

<style lang="scss" scoped>

    
</style>