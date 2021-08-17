<template>
    <div>

        <div class="query-editor">
            <div class="filter-row-wrapper" :class="{'filter-invalid': !this.query.filter.valid}">
                <!-- <div class="filter-label">filter</div> -->
                <!-- <div class="options-label">options</div> -->
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
                            <vue-tags-input
                                class="sort_params_input"
                                ref="sort_params_input"
                                @click.native="sortParamsClicked"
                                v-model="query.sort.tag"
                                :tags="query.sort.tags"
                                :add-on-key="[13, ' ']"
                                :validation="query.sort.validate"
                                :autocomplete-items="query.sort.autosuggestSortFields"
                                @tags-changed="newTags => query.sort.tags = newTags"
                                placeholder=""
                                :class="{'empty-value': (isValueEmpty('query.sort') && !query.sort.tag)}"
                                />
                        </div>
                        <div>
                            <div>projection</div>
                            <vue-tags-input
                                class="projection_params_input"
                                ref="projection_params_input"
                                @click.native="projectionParamsClicked"
                                v-model="query.projection.tag"
                                :tags="query.projection.tags"
                                :add-on-key="[13, ' ']"
                                :validation="query.projection.validate"
                                :autocomplete-items="query.projection.autosuggestSortFields"
                                @tags-changed="newTags => query.projection.tags = newTags"
                                placeholder=""
                                :class="{'empty-value': (isValueEmpty('query.projection') && !query.projection.tag)}"
                                />
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
                </div>
                <div class="query-options no-select">
                    <div class="query-row-margin">
                        <div>index hint</div>
                        <select class="hint-select" @mousedown="updateIndexes()" v-model.number="query.hint" :class="{'empty-value': isValueEmpty('query.hint')}">
                            <option></option>
                            <option v-for="index in activeDb.activeCollection.indexes" :key="index.name">{{index.name}}</option>
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
            <div class="no-select" v-if="false">
                Explain: 
                {{queryResult.explain}}
            </div>

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
                :key="queryResult.records[index].id" 
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
                                @click="updateDocument()"
                                :class="{'lighter': dbCollectionOptions.capped}" ><span>Update</span></a>
                            
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
                                {{moment(record.timestamp).format('YYYY-MM-DD')}}
                                <span class="lighter">-</span>
                                {{moment(record.timestamp).format('h:mm:ss a')}}
                            </span>
                        </span>
                        <span class="doc-actions no-select">
                            <a class="padding" @click.prevent="expandDoc(record)" v-if="!record.expand"><span>Expand</span></a>
                            <a class="padding" @click.prevent="collapseDoc(record)" v-if="record.expand"><span>Collapse</span></a>
                            <a class="padding" @click.prevent="expandAllDocs($event)" v-show="showOnlyExpandAll"><span>Expand All</span></a>
                            <a class="padding" @click.prevent="collapseAllDocs($event)" v-show="!showOnlyExpandAll"><span>Collapse All</span></a>
                            
                        </span>

                        <span class="doc-actions no-select clipboard">
                            <a class="padding" @click.prevent="copyToClipboard(record.doc)"><span>Copy to clipboard</span></a>
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

import * as mongodbQueryParser from 'mongodb-query-parser';
import VueTagsInput from '@johmun/vue-tags-input';
import * as actions from '../store/actions';
import * as mutations from '../store/mutations';
import api from '../api/api';
import * as a from 'awaiting';
import * as moment from 'moment';
import eventBus from '../eventBus';
import utils from '@/utils';
import _ from 'lodash';

import Prism from '@/vendor/prismjs/prism';
import '@/vendor/prismjs/prism.css';

import CodeJar from '@/components/CodeJar';
import Pagination from '@/components/Pagination';
import Loader from '@/components/Loader';
import DropdownMenu from '@/components/DropdownMenu';
import { gsap } from 'gsap'


window.gsap = gsap;

export default {
    components: {
        VueTagsInput,
        Loader,
        CodeJar,
        Pagination,
        DropdownMenu,
    },
    data: function() {
        return {
            queryLoading: false,
            query: getDefaultData(),
            paginationPageNumber: 1,
            paginationPageNumberLoading: null,
            paginationPageSize: 10,
            pageLoading: false,
            copyDropdownItems:[],
            worker: null,
            showOnlyExpandAll: true,
            DELETE_INFO_FIELD: '__punkmongo_deleted_c67f7242-9733-41c7-b799-feb96d7504cb',
        }
    },
    computed: {
        autosuggestSortFields() {
            return this.autocompleteItems.filter(i => {
                return i.text.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
            });
        },
        activeDb() {
            return this.$store.state.activeDb;
        },
        activeDbName() {
            return this.activeDb.name;
        },
        activeCollectionName() {
            return this.activeDb.activeCollection.name;
        },
        queryResult() {
            return this.activeDb.queryResult;
        },
        dbCollectionOptions: (state) => {
            const collection = state.activeDb.collections.find((collection) => {
                return collection.name == state.activeDb.activeCollection.name;
            });

            if (collection && collection.options) {
                return collection.options;
            }
            return {};
        },        

    },
    watch: {
        query: {
            handler: function(newValue, oldValue) {
                if (this.query.limit <= 0) {
                    this.query.limit = '';
                }
                if (this.query.timeout <= 0) {
                    this.query.timeout = '';
                }

            },
            deep: true
        },
        activeDbName: function(newVal, oldVal) {
            this.querySubmit();
        },
        activeCollectionName: function(newVal, oldVal) {
            if (newVal != oldVal) {
                this.resetQueryForm()
                this.resetPagination();
                this.$store.commit(mutations.RESET_COLLECTION_QUERY_RESULT);
                this.querySubmit()
                this.$refs.filterTextInput.$el.focus()
                utils.setCaret(this.$refs.filterTextInput.$el, 1, 3);
            }
        },
        async paginationPageNumberLoading(newValue, oldValue) {
            if (newValue !== oldValue && newValue) {
                await this.querySubmit()
            }
        },
        paginationPageSize(newValue, oldValue) { 
            if (newValue !== oldValue) {
                this.paginationPageNumber = this.paginationPageNumber;
                this.$nextTick(() => {
                    this.querySubmit();
                });      
                
            }
        }
    },
    methods: {
        getResultRecordNumber(index) {
            const recordNumber = this.paginationPageSize * (this.paginationPageNumber - 1) + index;
            return recordNumber + 1;
        },
        onChange(newValue) {
            this.query.filter.text = newValue;
            this.query.filter.valid = this.isFilterValid(this.query.filter.text);
        },
        isFilterValid(filter) {
            filter = filter.trim();
            try {
                mongodbQueryParser(filter)
            } catch (e) {
                return false;
            }
            return true;
        },
        sortParamsClicked() {
            this.$refs.sort_params_input.$el.querySelector('input').focus();
        },
        projectionParamsClicked() {
            this.$refs.projection_params_input.$el.querySelector('input').focus();
        },
        async querySubmit() {

            if (!this.activeDb.name || !this.activeDb.activeCollection.name) {
                return;
            }

            this.queryLoading = moment().valueOf();

            const sort = {};
            if (this.query.sort.tags.length > 0) {
                for (let tag of this.query.sort.tags) {
                    const [field, dir] = tag.text.split(':')
                    sort[field] = parseInt(dir, 10);
                }
            }

            const projection = this.parseProjection();

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
            };

            this.$store.commit(mutations.SET_COLLECTION_INDEXES, []);
            this.updateIndexes();
            
            const response = await api.request('collectionQuery', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name,
                query: query
            });

            for (let record of this.queryResult.records) {
                if (record[this.DELETE_INFO_FIELD]) {
                    clearInterval(record[this.DELETE_INFO_FIELD].restoreCountdownTimer);
                }
            }

            if (response.success) {
                this.$store.commit(mutations.SET_COLLECTION_QUERY_RESULT, {
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
                });

            } else {
                this.$store.commit(mutations.SET_COLLECTION_QUERY_RESULT, {
                    collName: this.activeDb.activeCollection.name,
                    result: {...defaultQueryResult, error: response.error}
                });
            }

            
            this.paginationPageNumber = this.queryResult.pageNumber;
            this.paginationPageNumberLoading = null;
            this.showOnlyExpandAll = true;
            
            
            // added delay before "finish loading" to prevent 
            // "visual jumping" of loader animation when it appears for milliseconds
            await a.delay(100); 

            this.queryLoading = false;
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
            this.paginationPageNumber = 1;
            this.paginationPageNumberLoading = null;
            this.paginationPageSize = 10;
            this.pageLoading = false;
        },
        highlight(code) {
            return Prism.highlight(code, Prism.languages['mongodb-document'], 'mongodb-document')
            // return await this.worker.postMessage('highlightMongoDocument', [code]);
        },
        copyToClipboardShown() {
            ;
        },
        copyToClipboardAll() {
            ;
        },
        copyToClipboard(record) {
            utils.copyToClipboard(record);
        },
        resetLimit() {
            this.query.limit = 0
        },
        resetTimeout() {
            this.query.timeout = 0
        },
        async updateIndexes(force = false) {
            if (!force && (!this.activeDb.name || !this.activeDb.activeCollection.name)) {
                return;
            }

            const response = await api.request('getIndexes', {
                db: this.activeDb.name, 
                collection: this.activeDb.activeCollection.name
            });

            if (! response.error) {
                this.$store.commit(mutations.SET_COLLECTION_INDEXES, response.result.indexes);
            }
        },
        resetHint() {
            this.query.hint = '';
        },
        expandAllDocs(event) {
            for (let record of this.queryResult.records) {
                this.$set(record, 'expand', true);
            }
            this.showOnlyExpandAll = false;

            this.$nextTick(async () => {
                await a.delay(10);

                const docEl = event.target.closest('.document');

                if (! utils.isInViewport(docEl)) {
                    docEl.scrollIntoView({block: 'start'});   
                }               
            });
        },
        collapseAllDocs(event) {
            for (let record of this.queryResult.records) {
                this.$set(record, 'expand', false);
            }
            this.showOnlyExpandAll = true;

            this.$nextTick(async () => {
                await a.delay(10);
                const docEl = event.target.closest('.document');
                
                if (! utils.isInViewport(docEl)) {
                    docEl.scrollIntoView({block: 'start'});   
                } 
            });
        },
        expandDoc(doc) {
            this.$set(doc, 'expand', true);
            
        },
        collapseDoc(doc) {
            this.$set(doc, 'expand', false);
        },
        moment: moment,
        async updateDocument() {
            if (this.dbCollectionOptions.capped) {
                alert(`Not supported for Capped collections`);
                return;
            }
        }, 
        async refreshDocument(record) {
            if (this.dbCollectionOptions.capped) {
                alert(`Not supported for Capped collections`);
                return;
            }

            const response = await api.request('getDocument', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name,
                _id: record.id,
                projection: this.parseProjection()
            });

            if (response.success) {
                const doc = response.result.document;
                record.doc = doc.doc;
                record.id = doc.id;
                record.timestamp = doc.timestamp;
            }

        },
        async deleteDocument(record, index) {
            if (this.dbCollectionOptions.capped) {
                alert(`Not supported for Capped collections`);
                return;
            }

            const response = await api.request('deleteDocument', {
                db: this.activeDb.name,
                collection: this.activeDb.activeCollection.name,
                _id: record.id,
            });

            if (response.success) {
                await this.prolongAllRestoreIds();

                
                this.$set(record, this.DELETE_INFO_FIELD, {
                    restoreId: response.result.restoreId,
                    restoreCountdown: 5,
                    restoreCountdownTimer: setInterval(() => {
               
                        record[this.DELETE_INFO_FIELD].restoreCountdown -= 1;
                        if (record[this.DELETE_INFO_FIELD].restoreCountdown === 0) {
                            clearInterval(record[this.DELETE_INFO_FIELD].restoreCountdownTimer);

                            const deleteAnim = gsap.timeline({
                                onComplete: () => {
                                    this.reloadResultsIfNoRecords();
                                }
                            });
                            deleteAnim.to(
                                this.$refs.documents[index], 
                                {xPercent: 120, duration: 0.3}
                            );
                            deleteAnim.to(
                                this.$refs.documents[index], 
                                {height: '0', marginBottom: '0', border: '0px',duration: 0.3},
                                '>'
                            );                        
                        }
                    }, 1000)
                });

            }
        },
        async restoreDocument(record) {
            const response = await api.request('restoreDocument', {
                restoreId: record[this.DELETE_INFO_FIELD].restoreId
            });            

            if (response.success) {
                if (response.result.restored) {
                    clearInterval(record[this.DELETE_INFO_FIELD].restoreCountdownTimer);
                    this.$delete(record, this.DELETE_INFO_FIELD);
                    await this.prolongAllRestoreIds();
                } else {
                    alert('Error restoring');
                }
                
            }
        },
        async prolongAllRestoreIds() {
            const expireAfterSecExpireServer = 10;
            const expireAfterSecExpireClient = 5;

            const deletedRecords = [];
            for (let record of this.queryResult.records) {
                if (record[this.DELETE_INFO_FIELD]) {       
                    deletedRecords.push(record);
                }
            }

            const response = await api.request(
                'updateRestoreDocumentExpiration', 
                {list: deletedRecords.map((item) => { 
                    return {
                        restoreId: item[this.DELETE_INFO_FIELD].restoreId,
                        expireAfterSec: expireAfterSecExpireServer
                    }
                })}
            );

            if (response.success) {
                for (let deletedRecord of deletedRecords) {
                    deletedRecord[this.DELETE_INFO_FIELD].restoreCountdown = expireAfterSecExpireClient;
                }
            }
        },
        parseProjection() {
            const projection = {};
            if (this.query.projection.tags.length > 0) {
                for (let tag of this.query.projection.tags) {
                    const [field, dir] = tag.text.split(':')
                    projection[field] = parseInt(dir, 10);
                }
            }
            return projection;
        },
        reloadResultsIfNoRecords() {
            const nonDeletedRecords = this.queryResult.records.filter((record) => {
                return (undefined == record[this.DELETE_INFO_FIELD]);
            });
            if (nonDeletedRecords.length === 0) {;
                this.querySubmit();
            }
        }
    },
    mounted: async function() {        

        this.worker = this.$worker.create([
            {message: 'highlightMongoDocument', func: (doc) => {
                return Prism.highlight(doc, Prism.languages['mongodb-document'], 'mongodb-document')
            }},
        ])

        eventBus.$on('databaseNavigation:collection-mousedown', (collectionName) => {
            if (collectionName == this.$route.params.collName) {
                // user clicked already active collection
                // let's reset form and reload data in collection
                this.resetQueryForm();
                this.querySubmit();
            }
        });

        this.copyDropdownItems = [
            {text: 'Shown documents', click: this.copyToClipboardShown}, 
            {text: 'All ' + this.queryResult.resultDocumentsTotal, click: this.copyToClipboardAll}
        ]


        if (! this.queryResult.initialLoadFinished) {
            this.querySubmit();
        }
        
    },
    destroyed: async function() {
        eventBus.$off('databaseNavigation:collection-mousedown');
        this.worker.unregister(['highlightMongoDocument'])
    }

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
                },
                {
                    text: '_id:-1'
                },
            ],
            validate: [{
                classes: 'field-with-direction',
                disableAdd: true,
                rule: ({
                    text
                }) => {
                    const invalid = (text.slice(-3) !== ':-1' && text.slice(-2) !== ':1');
                    return invalid;
                }
            }, ]
        },
        projection: {
            tag: '',
            tags: [],
            autocompleteItems: [{
                    text: '_id:1'
                },
                {
                    text: '_id:-1'
                },
            ],
            validate: [{
                classes: 'field-with-include-flag',
                disableAdd: true,
                rule: ({
                    text
                }) => {
                    const invalid = (text.slice(-2) !== ':0' && text.slice(-2) !== ':1');                   
                    return invalid;
                }
            }, ]
        },

        limit: '',
        timeout: '',
        hint: ''
    }
}
</script>

<style lang="scss" scoped>
.query-editor {
    padding: 1rem 0.8rem 0.4rem;
    background-color: rgb(238, 239, 255);
    border: 1px solid #e2e2e2;
    border-top: none;
}
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
    .vue-tags-input {
        display: inline-block;
        cursor: text;
    }
    .filter-label {
        display: inline-block;
        position: absolute;
        top: 1px;
        left: 1rem;
        font-size: 0.8rem;
        font-weight: 200;
        color: #c7c8d2;
        user-select: none;
        font-family: Verdana;
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
/deep/ {
    .ti-new-tag-input-wrapper {
        font-size: 1rem;
    }
    .vue-tags-input {
        width: 17.2rem;
        background-color: #fff;
        .ti-input {
            border: 1px solid #ddd;
            padding: 2px;
        }
        .ti-new-tag-input {
            font-family: "Courier New";
            background-color: #c8f7c8;
            color: #0a420a;
            // outline: 3px solid #c8f7c8;
        }
        .ti-invalid {
            background-color: #fff;
        }
    }

    .ti-tag {
        background-color: #5e87c1;
        cursor: default;
    }
}

.field-limit {
    width: 8rem;
}

.sort-and-projection {
    display: flex;
    justify-content: space-between;
    >div {
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
.sort_params_input,
.projection_params_input {
    user-select: none;
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

/deep/ .ti-new-tag-input-wrapper input {
    min-width: fit-content;
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
.timestamp-label {
    padding-left: 0.5em; 
}

.results-header {
    margin-top: 0.5em;
    margin-bottom: 1em;
    display: flex;
    justify-content: space-between;
}

.results-header, .results-footer{
    overflow: hidden;
}

.separator {
    margin-left: 0.5em;
    margin-right: 0.5em;
}
.document-date {
    padding: 0.5rem 0;
    &.border {
        // border-left: 1px solid #ccc;
    }
}
.query-results {
    overflow: hidden;
}

</style>








