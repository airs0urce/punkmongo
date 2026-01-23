<template>
    <div>
        <div class="page-header">
            New Database
        </div>

        <form class="no-select" @submit.prevent="createDatabase">
            <div class="form-row">
                <label class="field-name">Database Name</label>
                <input type="text" v-model="databaseName" @keyup.enter="createDatabase" ref="databaseName"/>
                <div v-if="errors.databaseName" class="local-error-text">{{errors.databaseName}}</div>
                <div v-if="validating" class="local-info-text">Validating database name...</div>
            </div>
        </form>
        <div class="gap"></div>

        <button @click="createDatabase()" class="confirm-button" :disabled="validating">
            <font-awesome-icon icon="plus" />
            Create Database
        </button>
        <button @click="goBack()" :disabled="validating">
            Cancel
        </button>
    </div>
</template>

<script>
import api from '../api/api'
import { useMainStore } from '../stores/main'
import { useRouter } from 'vue-router'

export default {
    setup() {
        const store = useMainStore()
        const router = useRouter()
        return { store, router }
    },
    data() {
        return {
            loading: false,
            validating: false,
            databaseName: '',
            errors: {
                databaseName: ''
            }
        }
    },
    methods: {
        async createDatabase() {
            this.errors.databaseName = null

            const validateNameRes = await this.validateDbName(this.databaseName)

            if (!validateNameRes.result.canCreate) {
                this.errors.databaseName = validateNameRes.result.reason
            } else {
                this.router.push({
                    name: 'new-collection',
                    params: { dbName: this.databaseName }
                })

                this.databaseName = ''
                this.errors.databaseName = null
            }
        },
        async validateDbName() {
            this.validating = true
            const response = await api.request('checkCanCreateDatabase', { db: this.databaseName })
            this.validating = false
            return response
        },
        goBack() {
            if (this.store.previosRoute) {
                this.router.go(-1)
            } else {
                this.router.push({
                    name: 'overview-databases'
                })
            }
        },
    },
    mounted() {
        this.$refs['databaseName'].focus()
    }
}
</script>

<style lang="scss" scoped>
</style>
