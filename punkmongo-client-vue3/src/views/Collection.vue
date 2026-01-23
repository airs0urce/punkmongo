<template>
    <div>
        <h1 class="page-header no-select" :style="{'min-width': `calc(100% - ${store.persistent.resizerPosition}px - 0.7rem)`}">
            <div v-if="activeDb.name && activeDb.activeCollection.name">
                <router-link to="/overview/databases">Databases</router-link>
                <font-awesome-icon icon="angle-right" class="arrow-separator" />
                <router-link class="with-select" :to="{name: 'database', params: {dbName: activeDb.name}}">{{activeDb.name}}</router-link>
                <font-awesome-icon icon="angle-right" class="arrow-separator with-select" /><span class="with-select">{{activeDb.activeCollection.name}} </span>
                <span class="lighter">({{numberWithCommas(getCollectionStats().objects)}})</span>
                <span class="collection-tags">
                    <TagCapped :collectionOptions="dbCollectionOptions" />
                    <TagCollation :collectionOptions="dbCollectionOptions" :hideDetailsAnimation="false" />
                    <TagTtl :ttlIndexes="ttlIndexes" />
                </span>
            </div>
        </h1>

        <ul class="tabs no-select" v-if="activeDb.name && activeDb.activeCollection.name">
            <router-link :to="{name: 'collection-manager-query', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}">Query</router-link>
            <router-link :to="{name: 'collection-manager-insert', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}">Insert</router-link>
            <router-link :to="{name: 'collection-manager-aggregate', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}">Aggregate</router-link>
            <router-link :to="{name: 'collection-manager-indexes', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}">Indexes</router-link>
            <router-link :to="{name: 'rename-collection', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}" class="rename-collection"><font-awesome-icon icon="pen" /> Rename Collection</router-link>
            <router-link :to="{name: 'drop-collection', params: {dbName: activeDb.name, collName: activeDb.activeCollection.name}}" class="drop-collection"><font-awesome-icon icon="trash-alt" /> Drop collection…</router-link>
        </ul>

        <CollectionQuery v-if="route.name == 'collection-manager-query' && activeDb.name && activeDb.activeCollection.name" ref="componentCollectionQuery" />
        <CollectionInsert v-if="route.name == 'collection-manager-insert' && activeDb.name && activeDb.activeCollection.name"/>
        <CollectionAggregate v-if="route.name == 'collection-manager-aggregate' && activeDb.name && activeDb.activeCollection.name"/>
        <CollectionIndexes v-if="route.name == 'collection-manager-indexes' && activeDb.name && activeDb.activeCollection.name" />
    </div>
</template>

<script>
import CollectionQuery from '@/components/CollectionQuery.vue'
import CollectionInsert from '@/components/CollectionInsert.vue'
import CollectionAggregate from '@/components/CollectionAggregate.vue'
import CollectionIndexes from '@/components/CollectionIndexes.vue'
import TagCapped from '@/components/TagCapped.vue'
import TagCollation from '@/components/TagCollation.vue'
import TagTtl from '@/components/TagTtl.vue'

import utils from '../utils'
import { useMainStore } from '../stores/main'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import eventBus from '../eventBus'

export default {
    components: {
        CollectionQuery, CollectionInsert,
        CollectionAggregate, CollectionIndexes,
        TagCapped,
        TagCollation,
        TagTtl
    },
    setup() {
        const store = useMainStore()
        const route = useRoute()
        const activeDb = computed(() => store.activeDb)
        const dbCollectionOptions = computed(() => {
            const collection = store.activeDb.collections.find((collection) => {
                return collection.name == store.activeDb.activeCollection.name
            })
            if (collection && collection.options) {
                return collection.options
            }
            return {}
        })
        const ttlIndexes = computed(() => {
            const indexes = store.activeDb.activeCollection.indexes
            const ttlIndexes = indexes.filter((index) => {
                return undefined !== index.expireAfterSeconds
            })
            return ttlIndexes
        })
        return { store, route, activeDb, dbCollectionOptions, ttlIndexes }
    },
    data() {
        return {
            selectedTab: 'query',
        }
    },
    methods: {
        setActiveCollection() {
            const collName = this.route.params.collName
            this.store.setActiveCollection(collName)
        },
        numberWithCommas: utils.numberWithCommas,
        bytesFormatted: utils.bytesFormatted,
        getCollectionStats() {
            const collection = this.activeDb.collections.find((coll) => {
                return coll.name == this.activeDb.activeCollection.name
            })
            if (!collection) {
                return {}
            }
            return collection.stats
        },
    },
    mounted() {
        if (this.route.params.dbName !== this.store.activeDb.name) {
            eventBus.emit('load-database', this.route.params.dbName)
        }
        // Only set active collection if db is already loaded
        if (this.store.activeDb.name) {
            this.setActiveCollection()
        }
    },
    watch: {
        'activeDb.name'(newVal) {
            // When database loads, set the active collection
            if (newVal && newVal === this.route.params.dbName) {
                this.setActiveCollection()
            }
        },
        $route(to) {
            if (to.name.startsWith('collection-manager-')) {
                this.setActiveCollection()
            }
        }
    },
    beforeRouteUpdate(to, from, next) {
        if (this.$refs.componentCollectionQuery) {
            this.$refs.componentCollectionQuery.resetRestoreCountdowns()
        }
        next()
    },
}
</script>

<style lang="scss" scoped>
.page-header {
    transform: translate(-1rem, -1rem);
    background-color: #fff;
    z-index: 10;
    position: fixed;
    padding: 0.5rem 1rem 0.5rem 1rem;
    border-bottom: 1px solid #ddd;
}

.tabs {
    list-style: none;
    display: flex;
    padding-left: 0;
    border-bottom: 1px solid #e2e2e2;

    padding-top: 3.4rem;

    a {
        cursor: default;
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
    .drop-collection {
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
:deep(.info-tag-details-ttl) {
    transform: translate(5em, 0px);
}
:deep(.info-tag-details-collation) {
    transform: translate(10em, 0px);
}
:deep(.info-tag-details-capped) {
    transform: translate(1.3em, 0px);
}

:deep(.collection-tab) {
    padding: 1rem 0.8rem 0.4rem;
    background-color: rgb(238, 239, 255);
    border: 1px solid #e2e2e2;
    border-top: none;
}
</style>
