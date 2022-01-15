<template>
    <div>
        <div class="page-header">
            <router-link :to="`/overview/databases`">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            <router-link :to="{name: 'database', params: {dbName: dbName}}">{{dbName}}</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />Drop "<router-link :to="{name: 'collection-manager', params: {dbName: dbName, collName: collName}}">{{collName}}</router-link>" collection
        </div>

        <form class="no-select">
            <div class="form-row">
                Are you sure you want to drop <strong>{{collName}} </strong> 
                <strong class="light">({{numberWithCommas(collectionRecordsAmount)}} docs)</strong> 
                collection?
            </div>
        </form>        
        <div class="gap"></div>

        <button @click="dropCollection()" class="btn-red confirm-button" :disabled="loading">
            <font-awesome-icon icon="trash-alt" /> Drop <strong>{{collName}}</strong>
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
import utils from '../utils'

export default {
    data: function() {
        return {
            loading: false,
        }
    },
    computed: {
        dbName() {
            return this.$route.params.dbName;
        },
        collName() {
            return this.$route.params.collName;
        },
        collectionRecordsAmount() {
            const activeDb = this.$store.state.activeDb;
            const collection = activeDb.collections.find((coll) => {
                return coll.name == this.$route.params.collName;
            });
            if (!collection) {
                return 0;
            }
            return collection.stats.objects;
        }
    },
    mounted() {
        
    },
    methods: {
        async dropCollection() {
            this.loading = true;
            const response = await api.request(
                'dropCollection', 
                {db: this.dbName, collection: this.collName}
            );
            
            if (response.success) {
                await this.$store.dispatch(actions.ACTION_LOAD_DB, this.dbName);
                this.$router.push({ 
                    name: 'database', 
                    params: { dbName: this.dbName }
                });
            }
            this.loading = false;
        },
        goBack() {
            if (this.$store.state.previosRoute) {
                this.$router.go(-1);
            } else {
                this.$router.push({ 
                    name: 'collection-manager', 
                    params: { 
                        dbName: this.dbName, 
                        collName: this.collName 
                    }
                });
            }
        },
        numberWithCommas: utils.numberWithCommas,
    }
}



</script>

<style lang="scss" scoped>

    
</style>