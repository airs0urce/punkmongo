<template>
    <div>
        <div class="page-header">
            <router-link to="/overview/databases">Databases</router-link>
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
import { useMainStore } from '../stores/main'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import utils from '../utils'

export default {
    setup() {
        const store = useMainStore()
        const route = useRoute()
        const router = useRouter()
        const dbName = computed(() => route.params.dbName)
        const collName = computed(() => route.params.collName)
        const collectionRecordsAmount = computed(() => {
            const activeDb = store.activeDb
            const collection = activeDb.collections.find((coll) => {
                return coll.name == route.params.collName
            })
            if (!collection) {
                return 0
            }
            return collection.stats.objects
        })
        return { store, route, router, dbName, collName, collectionRecordsAmount }
    },
    data() {
        return {
            loading: false,
        }
    },
    methods: {
        async dropCollection() {
            this.loading = true
            const response = await api.request(
                'dropCollection',
                { db: this.dbName, collection: this.collName }
            )

            if (response.success) {
                await this.store.loadDb(this.dbName)
                this.router.push({
                    name: 'database',
                    params: { dbName: this.dbName }
                })
            }
            this.loading = false
        },
        goBack() {
            if (this.store.previosRoute) {
                this.router.go(-1)
            } else {
                this.router.push({
                    name: 'collection-manager',
                    params: {
                        dbName: this.dbName,
                        collName: this.collName
                    }
                })
            }
        },
        numberWithCommas: utils.numberWithCommas,
    }
}
</script>

<style lang="scss" scoped>
</style>
