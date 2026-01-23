<template>
    <div class="collection-tab">
        <CodeJar
            v-model="doc"
            language="mongodb-document"
            class="mongo-query-editor mongodb-document-input"
            ref="insertDocInput"
            :shortkey="{win: ['ctrl', 'enter'], mac: ['meta', 'enter']}"
            @shortkey="insertDocument()"
        />

        <div class="gap"></div>

        <button @click="insertDocument" :disabled="loading">Insert Document</button>

        <div class="local-error-text block" v-if="msgError">{{msgError}}</div>
        <div class="local-info-text block" v-if="msgInfo">{{msgInfo}}</div>
    </div>
</template>

<script>
import Prism from '@/vendor/prismjs/prism.js'
import '@/vendor/prismjs/prism.css'
import CodeJar from '@/components/CodeJar.vue'
import { EJSON } from 'bson'
import api from '@/api/api'
import { useMainStore } from '../stores/main'
import { computed } from 'vue'

const emptyDoc = `{\n  \n}`

export default {
    components: {
        CodeJar
    },
    setup() {
        const store = useMainStore()
        const activeDb = computed(() => store.activeDb)
        const activeCollectionName = computed(() => store.activeDb.activeCollection.name)
        return { store, activeDb, activeCollectionName }
    },
    data() {
        return {
            loading: false,
            doc: emptyDoc,
            msgError: '',
            msgInfo: '',
        }
    },
    methods: {
        async insertDocument() {
            this.msgError = ''
            this.msgInfo = ''

            this.loading = true

            const response = await api.request('insertDocument', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name,
                doc: this.doc,
            })

            this.loading = false

            if (response.error) {
                this.msgError = `(Code ${response.error.code}) ${response.error.message}`
            } else {
                this.msgInfo = `Successfully inserted. ID of new record is ${response.result.insertedId}`
                this.doc = emptyDoc
            }
        }
    },
}
</script>

<style lang="scss">
.mongodb-document-input {
}
</style>
