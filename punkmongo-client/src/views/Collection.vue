<template>
    <div>
        <h1 class="page-header no-select">
            <div v-show="activeDb.name != ''">
                <router-link :to="`/overview/databases`">Databases</router-link>
                <font-awesome-icon icon="angle-right" class="arrow-separator" /> 
                <router-link class="with-select" :to="`/db/${activeDb.name}`">{{activeDb.name}}</router-link>
                <font-awesome-icon icon="angle-right" class="arrow-separator with-select" /><span class="with-select">{{activeDb.activeCollection.name}} </span>
                <span class="lighter">({{numberWithCommas(getCollectionStats().objects)}})</span>
                <span class="collection-tags">
                    <TagCapped :collectionOptions="dbCollectionOptions" />
                    <TagCollation :collectionOptions="dbCollectionOptions" :hideDetailsAnimation="false" />
                    <TagTtl :ttlIndexes="ttlIndexes" />
                </span>
            </div>
        </h1>

        <ul class="tabs no-select">
            
            <router-link :to="{name: 'collection-manager-query'}">Query</router-link>
            <router-link :to="{name: 'collection-manager-insert'}">Insert</router-link>
            <router-link :to="{name: 'collection-manager-aggregate'}">Aggregate</router-link>
            <router-link :to="{name: 'collection-manager-indexes'}">Indexes</router-link>
            <router-link :to="{name: 'rename-collection', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}" class="rename-collection"><font-awesome-icon icon="pen" /> Rename Collection</router-link>
            <router-link :to="{name: 'delete-collection', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}" class="delete-collection"><font-awesome-icon icon="trash-alt" /> Delete collection…</router-link>

            
        </ul>
        
        <CollectionQuery v-if="$route.name == 'collection-manager-query'" />
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
import TagCapped from '@/components/TagCapped';
import TagCollation from '@/components/TagCollation';
import TagTtl from '@/components/TagTtl';


import utils from '../utils'

import {
    mapState
} from 'vuex';
import eventBus from '../eventBus'
import * as mutations from '../store/mutations'

export default {
    components: {
        CollectionQuery, CollectionInsert, 
        CollectionAggregate, CollectionIndexes, 
        CollectionValidation,
        TagCapped, 
        TagCollation,
        TagTtl
    },
    data: function() {
        return {
            selectedTab: 'query',
        }
    },
    computed: mapState({
        activeDb: state => state.activeDb,
        dbCollectionOptions: (state) => {
            const collection = state.activeDb.collections.find((collection) => {
                return collection.name == state.activeDb.activeCollection.name;
            });

            if (collection && collection.options) {
                return collection.options;
            }
            return {};
        },
        ttlIndexes() {
            const indexes = this.activeDb.activeCollection.indexes;
            const ttlIndexes = indexes.filter((index) => {
                return undefined !== index.expireAfterSeconds;
            });
            return ttlIndexes;
        }
    }),
    methods: {
        setActiveCollection() {
            const collName = this.$route.params.collName;
            this.$store.commit(mutations.SET_ACTIVE_COLLECTION, collName);
        },
        numberWithCommas: utils.numberWithCommas,
        bytesFormatted: utils.bytesFormatted,
        getCollectionStats() {
            const collection = this.activeDb.collections.find((coll) => {
                return coll.name == this.activeDb.activeCollection.name;
            });
            if (!collection) {
                return {};
            }
            return collection.stats;
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
        cursor: default;
        // background-color: #fbfbff;
        border: 1px solid #eee;
        padding: 5px 10px;
        user-select: none;
        border-radius: 3px 3px 0 0;
        position: relative;
        bottom: -1px;
        border-bottom-color: #e2e2e2;
        margin-right: 0.2em;
        &:hover {
            color: #004499;
        }
        &.router-link-exact-active {
            border-color: #e2e2e2;
            border-bottom-color: transparent;
            background-color: #eeefff;
        }
    }
    a:last-of-type {
        margin-right: 0;
    }
    .rename-collection {
        color: #777;
        margin-left: auto;
        cursor: pointer;
        &:hover {
            color: #555;
        }
    }
    .delete-collection {
        background-color: #fff4f4;
        color: #ab5858;
        cursor: pointer;
        &:hover {
            color: #a23a3a;
        }
    }
}

.collection-tags {
    margin-left: 1rem;
}


</style>








