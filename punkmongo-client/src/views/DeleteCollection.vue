<template>
    <div>
        <div class="page-header">
            <router-link :to="`/overview/databases`">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            <router-link :to="`/db/${dbName}`">{{dbName}}</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />Delete "<router-link :to="`/db/${dbName}/col/${collName}`">{{collName}}</router-link>" collection
        </div>


        <form class="no-select">
            <div class="form-row">
                Are you sure you want to delete <strong>{{collName}} </strong> 
                <strong :class="{'lighter': collectionRecordsAmount == 0}">({{numberWithCommas(collectionRecordsAmount)}})</strong> 
                collection?

            </div>
        </form>        
        <div class="gap"></div>

        <button @click="deleteCollection()" class="btn-red confirm-button" :disabled="loading">
            <font-awesome-icon icon="trash-alt" /> Yes, delete it
        </button>
        <button @click="goToDatabasePage()" :disabled="loading">
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
                return {};
            }
            return collection.stats.objects;
        }
    },
    mounted() {
        
    },
    methods: {
        async deleteCollection() {
            this.loading = true;
            const response = await api.request(
                'deleteCollection', 
                {db: this.dbName, collection: this.collName}
            );
            
            if (response.success) {
                await this.$store.dispatch(actions.ACTION_LOAD_DB, this.dbName);
                this.goToDatabasePage();
            }
            this.loading = false;
        },
        goToDatabasePage() {
            if (this.$store.state.previosRoute) {
                this.$router.go(-1);
            } else {
                this.$router.push({ path: '/db/' + this.dbName });
            }
            
        },
        numberWithCommas: utils.numberWithCommas,
    }
}



</script>

<style lang="scss" scoped>

    .confirm-button {
        margin-right: 1rem;
    }
</style>