<template>
    <div>
        <div class="page-header">
            <router-link :to="`/overview/databases`">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />Drop "<router-link :to="{name: 'database', params: {dbName: dbName}}">{{dbName}}</router-link>" database
        </div>


        <form class="no-select">
            <div class="form-row">
                <div class="field-name">
                    <label for="drop-db-name">To drop </label><strong class="with-select">{{dbName}}</strong> database <label for="drop-db-name"> type (or copy/paste) the database name </label> below:    
                </div>
                <input type="text" v-model.trim="databaseName" ref="databaseName" id="drop-db-name" v-shortkey="['enter']" @shortkey="dropDatabase()" />
                <div v-if="errors.databaseName" class="local-error-text">{{errors.databaseName}}</div>
            </div>
        </form>        
        <div class="gap"></div>
        <button @click="dropDatabase()" class="btn-red confirm-button" :disabled="loading">
            <font-awesome-icon icon="trash-alt" /> Drop <strong>{{dbName}}</strong> database
        </button>
        <button @click="goBack()" :disabled="loading">
            Cancel
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
        async dropDatabase() {
            this.errors.databaseName = '';
            if (this.databaseName == '') {
                this.errors.databaseName = `Please enter database name for confirmation`;
                return;
            }
            if (this.databaseName != this.dbName) {
                this.errors.databaseName = `The entered name doesn't match database name`;
                return;
            }

            this.loading = true;
            const response = await api.request('dropDatabase', {db: this.dbName});
            
            if (response.success) {
                await this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);

                this.$router.push({
                    name: 'overview-databases', 
                    params: {}
                });
                this.databaseName = '';
            }
            this.loading = false;

        },
        goBack() {
            if (this.$store.state.previosRoute) {
                this.$router.go(-1);
            } else {
                this.$router.push({ 
                    name: 'database', 
                    params: { 
                        dbName: this.dbName, 
                    }
                });
            }
            
        },
    }
}



</script>

<style lang="scss" scoped>

    
</style>