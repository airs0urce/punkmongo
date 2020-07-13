<template>
    <div>
        <h1>
            <div v-if="activeDb.name != ''">
                Databases » 
                <router-link :to="`/db/${activeDb.name}`">{{activeDb.name}}</router-link>
                » {{activeDb.activeCollection}}
            </div>
        </h1>
        <br/>

        <ul class="tabs">
            <router-link :to="{name: 'collection-manager-query'}">Query/Update/Delete/Distinct</router-link>
            <router-link :to="{name: 'collection-manager-insert'}">Insert</router-link>
            <router-link :to="{name: 'collection-manager-aggregate'}">Aggregate</router-link>
            <router-link :to="{name: 'collection-manager-indexes'}">Indexes</router-link>
        </ul>
        
        <CollectionQuery v-if="$route.name == 'collection-manager-query'"/>
        <CollectionInsert v-if="$route.name == 'collection-manager-insert'"/>
        <CollectionAggregate v-if="$route.name == 'collection-manager-aggregate'"/>
        <CollectionIndexes v-if="$route.name == 'collection-manager-indexes'" />    


    </div>
</template>

<script>
import * as a from 'awaiting';
import CollectionQuery from '@/components/CollectionQuery';
import CollectionInsert from '@/components/CollectionInsert';
import CollectionAggregate from '@/components/CollectionAggregate';
import CollectionIndexes from '@/components/CollectionIndexes';
import CollectionValidation from '@/components/CollectionValidation';


import {
    mapState
} from 'vuex';
import eventBus from '../eventBus'
import * as mutations from '../store/mutations'

export default {
    components: {
        CollectionQuery, CollectionInsert, 
        CollectionAggregate, CollectionIndexes, 
        CollectionValidation
    },
    data: function() {
        return {
            selectedTab: 'query'
        }
    },
    computed: mapState({
        activeDb: state => state.activeDb,
    }),
    methods: {
        setActiveCollection() {
            const collName = this.$route.params.collName;
            this.$store.commit(mutations.SET_ACTIVE_COLLECTION, collName);
        },
    },
    mounted() {

        if (this.$route.params.dbName !== this.$store.state.activeDb.name) {
            eventBus.$emit('load-database', this.$route.params.dbName);
        }

        this.setActiveCollection();
    },

    watch: {
        async $route(to) {
            if (to.name.startsWith('collection-manager-')) {
                this.setActiveCollection();
            }
        }
    },
}
</script>

<style lang="scss" scoped>

.tabs {
    list-style: none;
    display: flex;
    padding-left: 0;
    border-bottom: 1px solid #e2e2e2;

    a {
        background-color: #eeefff;
        padding: 5px 10px;
        cursor: pointer;
        user-select: none;
        border: 1px solid transparent;
        border-radius: 3px 3px 0 0;
        position: relative;
        bottom: -1px;
        border-bottom-color: #e2e2e2;
        background-color: white;

        &.router-link-exact-active {
            border-color: #e2e2e2;
            border-bottom-color: transparent;
            background-color: #eeefff;
        }
    }
}



</style>








