<template>
    <div>
        <div class="collection-tab">
            <div class="filter-row-wrapper" :class="{'filter-invalid': !this.query.filter.valid}">
                <div class="filter-content-left">
                    <div class="no-select">filter</div>

                    <CodeJar
                        v-model="query.filter.text"
                        language="mongodb-filter"
                        class="mongo-query-editor"
                        ref="filterTextInput"
                        :shortkey="{win: ['ctrl', 'enter'], mac: ['meta', 'enter']}"
                        @shortkey="querySubmit()"
                    />

                    <div class="sort-and-projection query-row-margin no-select">
                        <div>
                            <div>sort</div>
                            <div class="tags-input-container">
                                <input
                                    type="text"
                                    class="tags-input"
                                    ref="sort_params_input"
                                    v-model="query.sort.tag"
                                    @keydown.enter="addSortTag"
                                    @keydown.space="addSortTag"
                                    placeholder="field:-1 or field:1"
                                    :class="{'empty-value': (isValueEmpty('query.sort') && !query.sort.tag)}"
                                />
                                <div class="tags-list">
                                    <span v-for="(tag, index) in query.sort.tags" :key="index" class="ti-tag">
                                        {{ tag.text }}
                                        <span class="ti-tag-remove" @click="removeSortTag(index)">&times;</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>projection</div>
                            <div class="tags-input-container">
                                <input
                                    type="text"
                                    class="tags-input"
                                    ref="projection_params_input"
                                    v-model="query.projection.tag"
                                    @keydown.enter="addProjectionTag"
                                    @keydown.space="addProjectionTag"
                                    placeholder="field:1 or field:0"
                                    :class="{'empty-value': (isValueEmpty('query.projection') && !query.projection.tag)}"
                                />
                                <div class="tags-list">
                                    <span v-for="(tag, index) in query.projection.tags" :key="index" class="ti-tag">
                                        {{ tag.text }}
                                        <span class="ti-tag-remove" @click="removeProjectionTag(index)">&times;</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="filter-row-wrapper footer">
                        <div class="submit-area">
                            <button @click="querySubmit">Submit Query</button>
                            <button @click="resetQueryForm">Reset Form</button>
                            <Loader v-if="queryLoading" />
                        </div>
                        <div class="rows-and-cost no-select">
                            <div class="cost-value" v-if="!queryLoading && queryResult.explain.executionStats" title="Query execution took time">{{queryResult.explain.executionStats.executionTimeMillis}} ms</div>
                        </div>
                    </div>
                    <div class="local-error-text block" v-if="msgError">{{msgError}}</div>
                </div>
                <div class="query-options no-select">
                    <div class="query-row-margin">
                        <div>index hint</div>
                        <select class="hint-select" @mousedown="updateIndexes()" v-model="query.hint" :class="{'empty-value': isValueEmpty('query.hint')}">
                            <option value=""></option>
                            <option v-for="index in activeDb.activeCollection.indexes" :key="index.name" :value="index.name">{{index.name}}</option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="resetHint()" v-if="query.hint" />
                    </div>
                    <div class="query-row-margin">
                        <div>limit</div>
                        <input type="number"
                            class="field-limit"
                            min="0"
                            placeholder="∞"
                            v-model.number="query.limit"
                            @keyup.enter="querySubmit()"
                            :class="{'empty-value': isValueEmpty('query.limit')}"
                        />

                        <font-awesome-icon class="reset-btn" icon="times" @click="resetLimit()" v-if="query.limit > 0" />
                    </div>
                    <div>
                        <div>execution timeout</div>
                        <span class="nowrap">
                            <input type="number"
                                min="1"
                                placeholder="∞"
                                class="timeout-input"
                                v-model.number="query.timeout"
                                @keyup.enter="querySubmit()"
                                :class="{'empty-value': isValueEmpty('query.timeout')}"
                            /> ms
                            <font-awesome-icon class="reset-btn" icon="times" @click="resetTimeout()" v-if="query.timeout > 0" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="query-results" v-if="queryResult.initialLoadFinished">
            <div class="gap"></div>

            <div class="light" v-if="queryResult.resultDocumentsTotal == 0 && !queryLoading">
                This collection is empty
            </div>

            <div class="results-header" v-if="queryResult.resultDocumentsTotal > 0">
                <Pagination
                    :totalRecords="queryResult.resultDocumentsTotal"
                    :pageSize="paginationPageSize"
                    :currentPage="paginationPageNumber"
                    :loadingPage="paginationPageNumberLoading"
                    :showPagesAround="6"
                    @change-page="paginationPageNumberLoading = $event"
                    @change-page-size="paginationPageSize = $event"
                />
            </div>

            <div v-for="(record, index) in queryResult.records"
                :key="record.id"
                class="document"
                ref="documents"
                :class="{'deleted': record[DELETE_INFO_FIELD]}"
            >
                <div class="document-header">
                    <span class="padding" v-if="record[DELETE_INFO_FIELD]">
                        The document has been deleted. <a @click="restoreDocument(record)">Restore the document ({{record[DELETE_INFO_FIELD].restoreCountdown}})</a>
                    </span>
                    <span v-if="!record[DELETE_INFO_FIELD]">
                        <span class="doc-actions no-select">
                            <span class="document-num">#{{getResultRecordNumber(index)}}</span>
                            <a class="padding"
                                :title="dbCollectionOptions.capped ? `Not supported for Capped collections`: ``"
                                @click="editDocument()"
                                :class="{'lighter': dbCollectionOptions.capped}" ><span>Edit</span></a>

                            <a class="padding"
                                :class="{'lighter': dbCollectionOptions.capped}"
                                :title="dbCollectionOptions.capped ? `Not supported for Capped collections`: ``"
                                @click="deleteDocument(record, index)"><span>Delete</span>
                            </a>

                            <a class="padding"
                                :class="{'lighter': dbCollectionOptions.capped}"
                                :title="dbCollectionOptions.capped ? `Not supported for Capped collections`: ``"
                                @click="refreshDocument(record)"><span>Refresh</span></a>
                        </span>
                        <span class="separator no-select" v-if="record.timestamp">
                            <span title="Creation date from _id field" class="document-date" :class="{'border': dbCollectionOptions.capped}">
                                {{formatMoment(record.timestamp, 'YYYY-MM-DD')}}
                                <span class="lighter">-</span>
                                {{formatMoment(record.timestamp, 'h:mm:ss a')}}
                            </span>
                        </span>
                        <span class="doc-actions no-select">
                            <a class="padding" @click.prevent="expandDoc(record)" v-if="!record.expand"><span>Expand</span></a>
                            <a class="padding" @click.prevent="collapseDoc(record)" v-if="record.expand"><span>Collapse</span></a>
                            <a class="padding" @click.prevent="expandAllDocs($event)" v-show="showOnlyExpandAll"><span>Expand All</span></a>
                            <a class="padding" @click.prevent="collapseAllDocs($event)" v-show="!showOnlyExpandAll"><span>Collapse All</span></a>
                        </span>

                        <span class="doc-actions no-select clipboard">
                            <a class="padding" @click.prevent="copyToClipboard(record)" style="min-width: 9.5em;">
                                <span v-if="!record._showCopiedMsg">Copy to clipboard</span>
                                <span v-if="record._showCopiedMsg" class="copied-msg">Copied!</span>
                            </a>
                        </span>
                    </span>
                </div>
                <div class="document-body language-mongodb-filter"
                    :class="{'expanded': record.expand}"
                    v-if="!record[DELETE_INFO_FIELD]"
                    v-html="highlight(record.doc, index)"></div>
            </div>

            <div class="results-footer" v-if="queryResult.resultDocumentsTotal > 0">
                <Pagination
                    :totalRecords="queryResult.resultDocumentsTotal"
                    :pageSize="paginationPageSize"
                    :currentPage="paginationPageNumber"
                    :loadingPage="paginationPageNumberLoading"
                    :showPagesAround="6"
                    @change-page="paginationPageNumberLoading = $event"
                    @change-page-size="paginationPageSize = $event"
                />
            </div>
        </div>
    </div>
</template>

<script>
import * as mongodbQueryParser from 'mongodb-query-parser'
import api from '@/api/api'
import moment from 'moment'
import eventBus from '../eventBus'
import utils, { delay } from '@/utils'
import _ from 'lodash'

import Prism from '@/vendor/prismjs/prism'
import '@/vendor/prismjs/prism.css'

import CodeJar from '@/components/CodeJar.vue'
import Pagination from '@/components/Pagination.vue'
import Loader from '@/components/Loader.vue'
import DropdownMenu from '@/components/DropdownMenu.vue'
import { gsap } from 'gsap'
import { useMainStore } from '../stores/main'
import { useRoute } from 'vue-router'
import { computed, reactive } from 'vue'

export default {
    components: {
        Loader,
        CodeJar,
        Pagination,
        DropdownMenu,
    },
    setup() {
        const store = useMainStore()
        const route = useRoute()
        const activeDb = computed(() => store.activeDb)
        const queryResult = computed(() => store.activeDb.queryResult)
        const dbCollectionOptions = computed(() => {
            const collection = store.activeDb.collections.find((collection) => {
                return collection.name == store.activeDb.activeCollection.name
            })
            if (collection && collection.options) {
                return collection.options
            }
            return {}
        })
        return { store, route, activeDb, queryResult, dbCollectionOptions }
    },
    data() {
        return {
            queryLoading: false,
            query: getDefaultData(),
            paginationPageNumber: 1,
            paginationPageNumberLoading: null,
            paginationPageSize: 10,
            pageLoading: false,
            copyDropdownItems: [],
            showOnlyExpandAll: true,
            DELETE_INFO_FIELD: '__punkmongo_deleted_c67f7242-9733-41c7-b799-feb96d7504cb',
            msgError: '',
        }
    },
    computed: {
        activeDbName() {
            return this.activeDb.name
        },
        activeCollectionName() {
            return this.activeDb.activeCollection.name
        },
    },
    watch: {
        query: {
            handler(newValue, oldValue) {
                if (this.query.limit <= 0) {
                    this.query.limit = ''
                }
                if (this.query.timeout <= 0) {
                    this.query.timeout = ''
                }
            },
            deep: true
        },
        activeDbName(newVal, oldVal) {
            this.querySubmit()
        },
        activeCollectionName(newVal, oldVal) {
            if (newVal != oldVal) {
                this.resetQueryForm()
                this.resetPagination()
                this.resetRestoreCountdowns()
                this.store.resetCollectionQueryResult()
                this.querySubmit()
                this.$refs.filterTextInput.$el.focus()
                utils.setCaret(this.$refs.filterTextInput.$el, 1, 3)
            }
        },
        async paginationPageNumberLoading(newValue, oldValue) {
            if (newValue !== oldValue && newValue) {
                await this.querySubmit()
            }
        },
        paginationPageSize(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.paginationPageNumber = this.paginationPageNumber
                this.$nextTick(() => {
                    this.querySubmit()
                })
            }
        }
    },
    methods: {
        addSortTag(event) {
            event.preventDefault()
            const text = this.query.sort.tag.trim()
            if (text && (text.endsWith(':1') || text.endsWith(':-1'))) {
                this.query.sort.tags.push({ text })
                this.query.sort.tag = ''
            }
        },
        removeSortTag(index) {
            this.query.sort.tags.splice(index, 1)
        },
        addProjectionTag(event) {
            event.preventDefault()
            const text = this.query.projection.tag.trim()
            if (text && (text.endsWith(':0') || text.endsWith(':1'))) {
                this.query.projection.tags.push({ text })
                this.query.projection.tag = ''
            }
        },
        removeProjectionTag(index) {
            this.query.projection.tags.splice(index, 1)
        },
        getResultRecordNumber(index) {
            const recordNumber = this.paginationPageSize * (this.paginationPageNumber - 1) + index
            return recordNumber + 1
        },
        onChange(newValue) {
            this.query.filter.text = newValue
            this.query.filter.valid = this.isFilterValid(this.query.filter.text)
        },
        isFilterValid(filter) {
            filter = filter.trim()
            try {
                mongodbQueryParser.parseFilter(filter)
            } catch (e) {
                return false
            }
            return true
        },
        async querySubmit() {
            this.msgError = ''

            if (!this.activeDb.name || !this.activeDb.activeCollection.name) {
                return
            }

            this.queryLoading = moment().valueOf()

            const sort = {}
            if (this.query.sort.tags.length > 0) {
                for (let tag of this.query.sort.tags) {
                    const [field, dir] = tag.text.split(':')
                    sort[field] = parseInt(dir, 10)
                }
            }

            const projection = this.parseProjection()

            const query = {
                filter: this.query.filter.text,
                options: {
                    sort: sort,
                    projection: projection,
                    limit: this.query.limit || false,
                    timeout: this.query.timeout || false,
                },
                pagination: {
                    pageSize: this.paginationPageSize,
                    pageNumber: this.paginationPageNumberLoading || this.paginationPageNumber
                }
            }

            this.store.setCollectionIndexes([])
            this.updateIndexes()

            const response = await api.request('collectionQuery', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name,
                query: query
            })

            this.resetRestoreCountdowns()

            if (response.success) {
                this.store.setCollectionQueryResult({
                    collName: this.activeDb.activeCollection.name,
                    result: {
                        error: null,
                        initialLoadFinished: true,
                        collectionDocumentsTotal: response.result.collectionDocumentsTotal,
                        resultDocumentsTotal: response.result.resultDocumentsTotal,
                        explain: response.result.explain,
                        pageNumber: response.result.pageNumber,
                        pagesTotal: response.result.pagesTotal,
                        records: response.result.records,
                    }
                })
            } else {
                this.msgError = response.error.message

                this.store.setCollectionQueryResult({
                    collName: this.activeDb.activeCollection.name,
                    result: {
                        error: response.error,
                        initialLoadFinished: true,
                        collectionDocumentsTotal: 0,
                        resultDocumentsTotal: 0,
                        explain: {},
                        pageNumber: 1,
                        pagesTotal: 1,
                        records: [],
                    }
                })
            }

            this.paginationPageNumber = this.queryResult.pageNumber
            this.paginationPageNumberLoading = null
            this.showOnlyExpandAll = true

            await delay(100)
            this.queryLoading = false
        },
        isValueEmpty(field) {
            if (field === 'query.limit') {
                return (this.query.limit <= 0)
            }
            if (field === 'query.sort') {
                return (!this.query.sort.tags || this.query.sort.tags.length === 0)
            }
            if (field === 'query.projection') {
                return (!this.query.projection.tags || this.query.projection.tags.length === 0)
            }
            if (field === 'query.timeout') {
                return (this.query.timeout <= 0)
            }
            if (field === 'query.hint') {
                return (this.query.hint == '')
            }
        },
        resetQueryForm() {
            Object.assign(this.$data.query, getDefaultData())
        },
        resetPagination() {
            this.paginationPageNumber = 1
            this.paginationPageNumberLoading = null
            this.paginationPageSize = 10
            this.pageLoading = false
        },
        resetRestoreCountdowns() {
            for (let record of this.queryResult.records) {
                if (record[this.DELETE_INFO_FIELD]) {
                    clearInterval(record[this.DELETE_INFO_FIELD].restoreCountdownTimer)
                }
            }
        },
        highlight(code) {
            return Prism.highlight(code, Prism.languages['mongodb-document'], 'mongodb-document')
        },
        async copyToClipboard(record) {
            if (record._showCopiedMsg) {
                return
            }
            utils.copyToClipboard(record.doc)
            record._showCopiedMsg = true
            await delay(1000)
            delete record._showCopiedMsg
        },
        resetLimit() {
            this.query.limit = 0
        },
        resetTimeout() {
            this.query.timeout = 0
        },
        async updateIndexes(force = false) {
            if (!force && (!this.activeDb.name || !this.activeDb.activeCollection.name)) {
                return
            }

            const response = await api.request('getIndexes', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name
            })

            if (!response.error) {
                this.store.setCollectionIndexes(response.result.indexes)
            }
        },
        resetHint() {
            this.query.hint = ''
        },
        expandAllDocs(event) {
            for (let record of this.queryResult.records) {
                record.expand = true
            }
            this.showOnlyExpandAll = false

            this.$nextTick(async () => {
                await delay(10)
                const docEl = event.target.closest('.document')
                if (!utils.isInViewport(docEl)) {
                    docEl.scrollIntoView({ block: 'start' })
                }
            })
        },
        collapseAllDocs(event) {
            for (let record of this.queryResult.records) {
                record.expand = false
            }
            this.showOnlyExpandAll = true

            this.$nextTick(async () => {
                await delay(10)
                const docEl = event.target.closest('.document')
                if (!utils.isInViewport(docEl)) {
                    docEl.scrollIntoView({ block: 'start' })
                }
            })
        },
        expandDoc(doc) {
            doc.expand = true
        },
        collapseDoc(doc) {
            doc.expand = false
        },
        formatMoment(timestamp, format) {
            return moment(timestamp).format(format)
        },
        async editDocument() {
            if (this.dbCollectionOptions.capped) {
                alert(`Not supported for Capped collections`)
                return
            }
        },
        async refreshDocument(record) {
            if (this.dbCollectionOptions.capped) {
                alert(`Not supported for Capped collections`)
                return
            }

            const response = await api.request('getDocument', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name,
                _id: record.id,
                projection: this.parseProjection()
            })

            if (!response.success) {
                alert(response.error.message)
                return
            }
            const doc = response.result.document
            record.doc = doc.doc
            record.id = doc.id
            record.timestamp = doc.timestamp
        },
        async deleteDocument(record, index) {
            if (this.dbCollectionOptions.capped) {
                alert(`Not supported for Capped collections`)
                return
            }

            const response = await api.request('deleteDocument', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name,
                _id: record.id,
            })

            if (!response.success) {
                alert(response.error.message)
                return
            }
            await this.prolongAllRestoreIds()

            record[this.DELETE_INFO_FIELD] = {
                restoreId: response.result.restoreId,
                restoreCountdown: 5,
                restoreCountdownTimer: setInterval(() => {
                    record[this.DELETE_INFO_FIELD].restoreCountdown -= 1
                    if (record[this.DELETE_INFO_FIELD].restoreCountdown === 0) {
                        clearInterval(record[this.DELETE_INFO_FIELD].restoreCountdownTimer)

                        const deleteAnim = gsap.timeline({
                            onComplete: () => {
                                this.reloadResultsIfNoRecords()
                            }
                        })
                        deleteAnim.to(
                            this.$refs.documents[index],
                            { xPercent: 120, duration: 0.3 }
                        )
                        deleteAnim.to(
                            this.$refs.documents[index],
                            { height: '0', marginBottom: '0', border: '0px', duration: 0.3 },
                            '>'
                        )
                    }
                }, 1000)
            }
        },
        async restoreDocument(record) {
            const response = await api.request('restoreDocument', {
                restoreId: record[this.DELETE_INFO_FIELD].restoreId
            })

            if (!response.success) {
                alert(response.error.message)
                return
            }

            clearInterval(record[this.DELETE_INFO_FIELD].restoreCountdownTimer)
            delete record[this.DELETE_INFO_FIELD]
            await this.prolongAllRestoreIds()
        },
        async prolongAllRestoreIds() {
            const expireAfterSecExpireServer = 10
            const expireAfterSecExpireClient = 5

            const deletedRecords = []
            for (let record of this.queryResult.records) {
                if (record[this.DELETE_INFO_FIELD]) {
                    deletedRecords.push(record)
                }
            }

            const response = await api.request(
                'updateRestoreDocumentExpiration',
                {
                    list: deletedRecords.map((item) => {
                        return {
                            restoreId: item[this.DELETE_INFO_FIELD].restoreId,
                            expireAfterSec: expireAfterSecExpireServer
                        }
                    })
                }
            )

            if (response.success) {
                for (let deletedRecord of deletedRecords) {
                    deletedRecord[this.DELETE_INFO_FIELD].restoreCountdown = expireAfterSecExpireClient
                }
            }
        },
        parseProjection() {
            const projection = {}
            if (this.query.projection.tags.length > 0) {
                for (let tag of this.query.projection.tags) {
                    const [field, dir] = tag.text.split(':')
                    projection[field] = parseInt(dir, 10)
                }
            }
            return projection
        },
        reloadResultsIfNoRecords() {
            const nonDeletedRecords = this.queryResult.records.filter((record) => {
                return (undefined == record[this.DELETE_INFO_FIELD])
            })
            if (nonDeletedRecords.length === 0) {
                this.querySubmit()
            }
        }
    },
    async mounted() {
        eventBus.on('databaseNavigation:collection-mousedown', (collectionName) => {
            if (collectionName == this.route.params.collName) {
                this.resetQueryForm()
                this.querySubmit()
            }
        })

        this.copyDropdownItems = [
            { text: 'Shown documents', click: () => {} },
            { text: 'All ' + this.queryResult.resultDocumentsTotal, click: () => {} }
        ]

        if (!this.queryResult.initialLoadFinished) {
            this.querySubmit()
        }
    },
    unmounted() {
        eventBus.off('databaseNavigation:collection-mousedown')
    },
}

function getDefaultData() {
    return {
        filter: {
            text: `{\n  \n}`,
            valid: true,
        },
        sort: {
            tag: '',
            tags: [{
                text: '_id:-1'
            }],
            autocompleteItems: [{
                text: '_id:1'
            }, {
                text: '_id:-1'
            }],
        },
        projection: {
            tag: '',
            tags: [],
            autocompleteItems: [{
                text: '_id:1'
            }, {
                text: '_id:-1'
            }],
        },
        limit: '',
        timeout: '',
        hint: ''
    }
}
</script>

<style lang="scss" scoped>
.filter-row-wrapper {
    display: flex;
    align-items: flex-start;
    overflow: hidden;
    margin-bottom: 0.3rem;
    position: relative;

    .query-options {
        padding-left: 1rem;
        > div {
            margin-bottom: 0.3rem;
        }
    }
    &.footer {
        align-items: baseline;
        justify-content: flex-start;
        margin-top: 1.2rem;
        .rows-and-cost {
            > div {
                display: inline-block;
            }
        }
    }
}

.tags-input-container {
    border: 1px solid #ddd;
    padding: 2px;
    background-color: #fff;
    min-height: 2em;
}

.tags-input {
    border: none;
    outline: none;
    font-family: "Courier New";
    background-color: #c8f7c8;
    color: #0a420a;
    width: 100%;
    padding: 2px;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin-top: 2px;
}

.ti-tag {
    background-color: #5e87c1;
    color: #fff;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 0.9em;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.ti-tag-remove {
    cursor: pointer;
    font-weight: bold;
    &:hover {
        color: #ffcccc;
    }
}

.field-limit {
    width: 8rem;
}

.sort-and-projection {
    display: flex;
    justify-content: space-between;
    > div {
        width: calc(50% - 0.5rem);
        > div {
            width: 100%;
        }
    }
}

.filter-content-left {
    width: 600px;
    border-right: 2px solid #cecef94a;
    padding-right: 1rem;
}

.submit-area {
    display: flex;
    align-items: center;
}
.submit-area > * {
    margin-right: 1rem;
}

.timeout-input {
    width: 8rem;
}
.hint-select {
    width: 20rem;
}

div.document {
    border: 2px #ccc solid;
    margin-bottom: 1em;
    &:hover {
        background-color: rgb(238, 239, 255);
    }
    &.deleted {
        overflow: hidden;
        .document-header {
            border-bottom: none;
        }
    }
}

.query-row-margin {
    margin-top: 0.5rem;
}

.document-header {
    height: 2rem;
    border-bottom: 2px solid #ccc;
    .padding {
        padding: 0.5em;
        display: inline-block;
    }
    a.padding {
        border-right: 1px solid #ccc;
        &:active span,
        &.press-active span {
            position: relative;
            top: 1px;
            left: 1px;
        }
    }
    .doc-actions a:first-of-type {
        border-left: 1px solid #ccc;
    }
    .doc-actions.clipboard {
        float: right;
        a {
            border-right: 0;
        }
    }
}
.document-body {
    white-space: pre-wrap;
    padding-left: 0.5em;
    padding-top: 0.25em;
    padding-bottom: 0.25em;
    font-size: 1.1em;
    overflow-y: hidden;
    overflow-x: auto;
    max-height: 11.5em;
    &.expanded {
        max-height: none;
    }
}
.document-num {
    padding-left: 0.3em;
    padding-right: 0.3em;
}

.results-header {
    margin-top: 0.5em;
    margin-bottom: 1em;
    display: flex;
    justify-content: space-between;
}

.results-header, .results-footer {
    overflow: hidden;
}

.separator {
    margin-left: 0.5em;
    margin-right: 0.5em;
}
.document-date {
    padding: 0.5rem 0;
}
.query-results {
    overflow: hidden;
}

.copied-msg {
    color: #000;
    cursor: default;
}
</style>
