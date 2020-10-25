<template>
    <div>
        <div class="page-header">
            <router-link :to="`/overview/databases`">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            <router-link :to="`/db/${dbName}`">{{dbName}}</router-link>        
            <font-awesome-icon icon="angle-right" class="arrow-separator" />Rename "<router-link :to="`/db/${dbName}/col/${collName}`" class="with-select">{{collName}}</router-link>" collection    
        </div>


        <form class="no-select">
            <div class="form-row">
                New collection name
                <input type="text" 
                    class="new-collection-name"
                    spellcheck="false"
                    ref="newCollectionName" 
                    v-model="newCollectionName"
                    v-shortkey="['enter']" 
                    @shortkey="renameCollection()" 
                />
                <span v-if="errors.newCollectionName" class="local-error-text">{{errors.newCollectionName}}</span>    
                
                
            </div>
        </form>        
        <div class="gap"></div>

        <button @click="renameCollection()" class="confirm-button" :disabled="loading">
            <font-awesome-icon icon="pen" /> Rename
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
            newCollectionName: '',
            errors: {
                newCollectionName: null
            }
        }
    },
    computed: {
        dbName() {
            return this.$route.params.dbName;
        },
        collName() {
            return this.$route.params.collName;
        },
    },
    mounted() {
        this.newCollectionName = this.collName;
        this.$refs.newCollectionName.focus();
    },
    methods: {
        async renameCollection() {
            this.errors.newCollectionName = null;
            this.loading = true;
            const response = await api.request(
                'renameCollection', 
                {
                    db: this.dbName, 
                    collection: this.collName, 
                    newCollectionName: this.newCollectionName
                }
            );
            
            if (response.success) {
                await this.$store.dispatch(actions.ACTION_LOAD_DB, this.dbName);
                this.$router.push({
                    name: 'collection-manager', 
                    params: {
                        dbName: this.dbName, 
                        collName: this.newCollectionName
                    }
                });
            } else {
                this.errors.newCollectionName = response.error.message.split('\n')[0];
                this.$refs.newCollectionName.focus();
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

    
    .new-collection-name {
        width: 20rem;
    }
</style>