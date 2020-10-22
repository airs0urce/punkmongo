<template>
    <div>
        <div class="page-header">
            <router-link :to="`/overview/databases`">Databases</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />
            <router-link :to="`/db/${dbName}`">{{dbName}}</router-link>
            <font-awesome-icon icon="angle-right" class="arrow-separator" />New Collection
        </div>


        <div class="local-notice bottom-gap" v-if="!selectedDatabaseExists">
            MongoDB will create database only if you add at least one collection in the database.
            <a href="https://docs.mongodb.com/manual/faq/fundamentals/#how-do-i-create-a-database-and-a-collection" target="_blank">More Information</a>
        </div>

        <form class="no-select">
            <div class="form-row">
                <label class="field-name">Collection Name</label>
                <input type="text" v-model.trim="collectionName" ref="collectionName" class="collection-name" v-shortkey="['enter']" @shortkey="createCollection()" />
                <div v-if="errors.collectionName" class="local-error-text">{{errors.collectionName}}</div>
                <div v-if="validating" class="local-info-text">Validating collection name...</div>
            </div>
            <div class="form-row">
                <label><input v-model="cappedCollection" type="checkbox" /> Capped Collection</label>
                <a href="https://docs.mongodb.com/manual/core/capped-collections/" target="_blank">
                    <font-awesome-icon icon="question-circle" class="icon-help" /> 
                </a>
                <div v-if="errors.cappedNotSet" class="local-error-text">You have to set either "Max size" or "Max number of documents" for capped collection</div>
            </div>
            <div v-if="cappedCollection">
                <div class="form-row-padding">
                    <label class="field-name" for="max-size">Max size:</label>
                    <input type="number" step="1" id="max-size" v-model.number="cappedCollectionSize" :class="{'empty-value': '' === cappedCollectionSize}" /> MB
                </div>   
                <div class="form-row-padding">
                    <label class="field-name" for="max-docs-num">Max number of documents:</label>
                    <input type="number" step="1" id="max-docs-num" v-model.number="cappedCollectionMax" :class="{'empty-value': '' === cappedCollectionMax}" />
                </div> 
            </div>
            
            <div class="form-row">
                <label><input v-model="useCustomCollation" type="checkbox" /> Use Custom Collation</label>
                <a href="https://docs.mongodb.com/master/reference/collation/" target="_blank">
                    <font-awesome-icon icon="question-circle" class="icon-help" /> 
                </a>
            </div>
            <div v-if="useCustomCollation" class="custom-collation">
                <div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-locale">{{collectionOptions.locale.title}}</label>
                        <select v-model="customCollation.locale" id="collation-locale">
                            <option v-for="value in collectionOptions.locale.values" :value="value.value">
                                {{ value.value }} - {{ value.text }}
                            </option>
                        </select>
                    </div>
                    <div v-if="customCollation.locale != 'simple'">
                        <div class="form-row-padding">
                            <label class="field-name" for="collation-strength">{{collectionOptions.strength.title}}</label>
                            <select v-model="customCollation.strength" id="collation-strength" :class="{'empty-value': '' === customCollation.strength}">
                                <option value="">default</option>
                                <option v-for="value in collectionOptions.strength.values" :value="value.value">
                                    {{ value.value }} - {{ value.text }}
                                </option>
                            </select>
                            <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.strength = ''" :class="{'hidden': '' === customCollation.strength}" />
                        </div>
                        <div class="form-row-padding">
                            <label class="field-name" for="collation-use-case-level" :title="collectionOptions.caseLevel.description">{{collectionOptions.caseLevel.title}}</label>
                            <select v-model="customCollation.caseLevel" id="collation-use-case-level" :class="{'empty-value': '' ===customCollation.caseLevel}">
                                <option value="">default</option>
                                <option v-for="value in collectionOptions.caseLevel.values" :value="value.value">
                                    {{ value.value }} - {{ value.text }}
                                </option>
                            </select>
                            <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.caseLevel = ''" :class="{'hidden': '' === customCollation.caseLevel}" />
                        </div>
                        <div class="form-row-padding">
                            <label class="field-name" for="collation-case-first">{{collectionOptions.caseFirst.title}}</label>
                            <select v-model="customCollation.caseFirst" id="collation-case-first" :class="{'empty-value': '' === customCollation.caseFirst}">
                                <option value="">default</option>
                                <option v-for="value in collectionOptions.caseFirst.values" :value="value.value">
                                    {{ value.value }} - {{ value.text }}
                                </option>
                            </select>
                            <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.caseFirst = ''" :class="{'hidden': '' === customCollation.caseFirst}" />
                        </div>
                    </div>
                </div>
                <div v-if="customCollation.locale != 'simple'">
                    <div class="form-row-padding">
                            <label class="field-name" for="collation-numeric-ordering">{{collectionOptions.numericOrdering.title}}</label>
                            <select v-model="customCollation.numericOrdering" id="collation-numeric-ordering" :class="{'empty-value': '' === customCollation.numericOrdering}">
                                <option value="">default</option>
                                <option v-for="value in collectionOptions.numericOrdering.values" :value="value.value">
                                    {{ value.text }}
                                </option>
                            </select>
                            <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.numericOrdering = ''" :class="{'hidden': '' === customCollation.numericOrdering}" />
                        </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-alternate">{{collectionOptions.alternate.title}}</label>
                        <select v-model="customCollation.alternate" id="collation-alternate" :class="{'empty-value': '' === customCollation.alternate}">
                            <option value="">default</option>
                            <option v-for="value in collectionOptions.alternate.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.alternate = ''" :class="{'hidden': '' === customCollation.alternate}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-max-variable">{{collectionOptions.maxVariable.title}}</label>
                        <select v-model="customCollation.maxVariable" id="collation-max-variable" :class="{'empty-value': '' === customCollation.maxVariable}">
                            <option value="">default</option>
                            <option v-for="value in collectionOptions.maxVariable.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.maxVariable = ''" :class="{'hidden': '' === customCollation.maxVariable}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-backwards">{{collectionOptions.backwards.title}}</label>
                        <select v-model="customCollation.backwards" id="collation-backwards" :class="{'empty-value': '' === customCollation.backwards}">
                            <option value="">default</option>
                            <option v-for="value in collectionOptions.backwards.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.backwards = ''" :class="{'hidden': '' === customCollation.backwards}" />
                    </div>   
                </div>
            </div>
            <div class="local-error-text top-gap" v-if="errors.createCollectionError">{{errors.createCollectionError}}</div>
            
        </form>
        <div class="gap"></div>
        <button @click="createCollection()" :disabled="loading">Create Collection</button>
        

    </div>
</template>

<script>
import api from '../api/api'
import collectionOptions from '../collectionOptions'
import eventBus from '../eventBus'
import * as actions from '../store/actions'
import * as a from 'awaiting';

export default {
    data: function() {
        return {
            collectionOptions: collectionOptions,
            loading: false,

            collectionName: '',
            cappedCollection: false,
            cappedCollectionMax: '',
            cappedCollectionSize: '',
            useCustomCollation: false,
            customCollation: {
                locale: 'simple',
                strength: '',
                caseLevel: '',
                caseFirst: '',
                numericOrdering: '',
                alternate: '',
                maxVariable: '',
                backwards: '',
            },
            
            errors: {
                collectionName: null,
                cappedNotSet: false,
                createCollectionError: null
            },
            validating: false,
        }
    },
    computed: {
        selectedDatabaseExists() {
            let exists = false;
            for (let db of this.$store.state.persistent.dbList) {
                if (db.name == this.$store.state.activeDb.name) {
                    exists = true;
                    break;
                }
            }
            return exists;
        },
        dbName() {
            return this.$route.params.dbName;
        }

    },
    watch: {
        cappedCollection() {
            this.errors.cappedNotSet = false;
        }
    },
    mounted() {
        this.resetForm();
        this.$refs['collectionName'].focus();
    },
    methods: {
        async createCollection() {
            this.errors.collectionName = null;
            this.errors.cappedNotSet = false
            this.errors.createCollectionError = null;

            let error = false;
            const validateNameRes = await this.validateCollectionName(this.collectionName);
            if (!validateNameRes.result.canCreate) {
                this.errors.collectionName = validateNameRes.result.reason
                error = true;
            }
    
            if (this.cappedCollection && this.cappedCollectionMax === '' && this.cappedCollectionSize === '') {
                this.errors.cappedNotSet = true;
                error = true;
            }

            if (error) {
                return;
            }

            const createCollectionParams = {
                db: this.dbName, 
                collection: this.collectionName,
                capped: {
                    enable: this.cappedCollection,
                    options: {
                        max: this.cappedCollectionMax,
                        size: this.cappedCollectionSize /* MB */ * 1024 * 1024
                    }
                },
                collation: {
                    enable: this.useCustomCollation,
                    options: {
                        locale: this.customCollation.locale,
                        strength: this.customCollation.strength,
                        caseLevel: this.customCollation.caseLevel,
                        caseFirst: this.customCollation.caseFirst,
                        numericOrdering: this.customCollation.numericOrdering,
                        alternate: this.customCollation.alternate,
                        maxVariable: this.customCollation.maxVariable,
                        backwards: this.customCollation.backwards,
                    }
                }
            };

            if ('' === createCollectionParams.capped.options.max) {
                delete createCollectionParams.capped.options.max;
            }
            for (let field in createCollectionParams.collation.options) {
                if ('' === createCollectionParams.collation.options[field]) {
                    if (field == 'locale') {
                        continue;
                    }
                    delete createCollectionParams.collation.options[field];
                }
            }
            
            this.loading = true;
            const response = await api.request('createCollection', createCollectionParams);
            if (response.error) {
                if (response.error.code < 100) {
                    this.errors.createCollectionError = response.error.message;
                }
            } else {
                const dbNames = this.$store.state.persistent.dbList.map((dbItem) => { return dbItem.name });
                if (! dbNames.includes(this.dbName)) {
                    // reload database list
                    await this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);
                }

                // relaod collections list 
                await this.$store.dispatch(actions.ACTION_LOAD_DB, this.dbName);

                this.$router.push({
                    name: 'collection-manager', 
                    params: {dbName: this.dbName, collName: this.collectionName}
                });
                this.resetForm();
            }
            this.loading = false;
        },
        resetForm() {
            this.collectionName = '';
            this.cappedCollection = false;
            this.cappedCollectionMax = '';
            this.cappedCollectionSize = '';
            this.useCustomCollation = false;
            this.customCollation = {
                locale: 'simple',
                strength: '',
                caseLevel: '',
                caseFirst: '',
                numericOrdering: '',
                alternate: '',
                maxVariable: '',
                backwards: '',
            };
        },
        validateCollectionName: async function() {
            this.validating = true;
            const response = await api.request(
                'checkCanCreateCollection', 
                {db: this.dbName, collection: this.collectionName}
            );
            this.validating = false;
            return response;
        }
    }
}



</script>

<style lang="scss" scoped>
    .collection-name {
        width: 20em;
    }
    select {
        width: 17rem;
    }
    #max-docs-num, #max-size {
        width: 7rem;
    }
    .custom-collation select {
        width: 25em;
    }
    .custom-collation {
        display: flex;
    }
    .hidden {
        visibility: hidden;
    }
    
</style>