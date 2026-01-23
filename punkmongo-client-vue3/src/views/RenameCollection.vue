<template>
    <div>
        <div class="page-header">
            <router-link to="/overview/databases">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            <router-link :to="{name: 'database', params: {dbName: dbName}}">{{dbName}}</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />Rename "<router-link :to="{name: 'collection-manager', params: {dbName: dbName, collName: collName}}" class="with-select">{{collName}}</router-link>" collection
        </div>

        <form class="no-select" @submit.prevent="renameCollection">
            <div class="form-row">
                New collection name
                <input type="text"
                    class="new-collection-name"
                    spellcheck="false"
                    ref="newCollectionName"
                    v-model="newCollectionName"
                    @keyup.enter="renameCollection"
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
        return { store, route, router, dbName, collName }
    },
    data() {
        return {
            loading: false,
            newCollectionName: '',
            errors: {
                newCollectionName: null
            }
        }
    },
    mounted() {
        this.newCollectionName = this.collName
        this.$refs.newCollectionName.focus()
    },
    methods: {
        async renameCollection() {
            this.errors.newCollectionName = null
            this.loading = true
            const response = await api.request(
                'renameCollection',
                {
                    db: this.dbName,
                    collection: this.collName,
                    newCollectionName: this.newCollectionName
                }
            )

            if (response.success) {
                await this.store.loadDb(this.dbName)
                this.router.push({
                    name: 'collection-manager',
                    params: {
                        dbName: this.dbName,
                        collName: this.newCollectionName
                    }
                })
            } else {
                this.errors.newCollectionName = response.error.message.split('\n')[0]
                this.$refs.newCollectionName.focus()
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
.new-collection-name {
    width: 20rem;
}
</style>
