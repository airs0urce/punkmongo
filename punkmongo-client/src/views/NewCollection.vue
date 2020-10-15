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
                <input type="text" v-model="collectionName" ref="collectionName" class="collection-name" v-shortkey="['enter']" @shortkey="createCollection()" />
                <div v-if="errors.collectionName" class="local-error-text inline">{{errors.collectionName}}</div>
                <div v-if="validating" class="local-info-text inline">Validating collection name...</div>
            </div>
            <div class="form-row">
                <label><input v-model="cappedCollection" type="checkbox" /> Capped Collection</label>
                <a href="https://docs.mongodb.com/manual/core/capped-collections/" target="_blank">
                    <font-awesome-icon icon="question-circle" class="icon-help" /> 
                </a>
            </div>
            <div v-if="cappedCollection">
                <div class="form-row-padding">
                    <label class="field-name" for="max-docs-num">Max number of documents:</label>
                    <input type="number" step="1" id="max-docs-num" />
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="max-size">Max size:</label>
                    <input type="number" step="1" id="max-size" /> MB
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
                        <label class="field-name" for="collation-locale">Locale</label>
                        <select v-model="customCollation.locale" id="collation-locale" :class="{'empty-value': '' === customCollation.locale}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.locale.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.locale = ''" :class="{'hidden': '' === customCollation.locale}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-strength">Strength</label>
                        <select v-model="customCollation.strength" id="collation-strength" :class="{'empty-value': '' === customCollation.strength}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.strength.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.strength = ''" :class="{'hidden': '' === customCollation.strength}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-use-case-level">Use Case-Level</label>
                        <select v-model="customCollation.caseLevel" id="collation-use-case-level" :class="{'empty-value': '' ===customCollation.caseLevel}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.caseLevel.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.caseLevel = ''" :class="{'hidden': '' === customCollation.caseLevel}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-case-first">Case First</label>
                        <select v-model="customCollation.caseFirst" id="collation-case-first" :class="{'empty-value': '' === customCollation.caseFirst}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.caseFirst.values" :value="value.value">
                                {{ value.value }} - {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.caseFirst = ''" :class="{'hidden': '' === customCollation.caseFirst}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-numeric-ordering">Numeric Ordering</label>
                        <select v-model="customCollation.numericOrdering" id="collation-numeric-ordering" :class="{'empty-value': '' === customCollation.numericOrdering}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.numericOrdering.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.numericOrdering = ''" :class="{'hidden': '' === customCollation.numericOrdering}" />
                    </div>
                </div>
                <div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-alternate">Alternate</label>
                        <select v-model="customCollation.alternate" id="collation-alternate" :class="{'empty-value': '' === customCollation.alternate}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.alternate.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.alternate = ''" :class="{'hidden': '' === customCollation.alternate}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-max-variable">Max-Variable</label>
                        <select v-model="customCollation.maxVariable" id="collation-max-variable" :class="{'empty-value': '' === customCollation.maxVariable}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.maxVariable.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.maxVariable = ''" :class="{'hidden': '' === customCollation.maxVariable}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-backwards">Backwards</label>
                        <select v-model="customCollation.backwards" id="collation-backwards" :class="{'empty-value': '' === customCollation.backwards}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.backwards.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.backwards = ''" :class="{'hidden': '' === customCollation.backwards}" />
                    </div>
                    <div class="form-row-padding">
                        <label class="field-name" for="collation-normalization">Normalization</label>
                        <select v-model="customCollation.normalization" id="collation-normalization" :class="{'empty-value': '' === customCollation.normalization}">
                            <option disabled value="">default</option>
                            <option v-for="value in collectionOptions.normalization.values" :value="value.value">
                                {{ value.text }}
                            </option>
                        </select>
                        <font-awesome-icon class="reset-btn" icon="times" @click="customCollation.normalization = ''" :class="{'hidden': '' === customCollation.normalization}" />
                    </div>    
                </div>
            </div>
            
        </form>
        <div class="gap"></div>
        <button @click="createCollection()">Create Collection</button>
        

    </div>
</template>

<script>
import api from '../api/api'
import collectionOptions from '../collectionOptions'


export default {
    data: function() {
        return {
            collectionOptions: collectionOptions,
            cappedCollection: false,
            useCustomCollation: true,
            customCollation: {
                locale: '',
                strength: '',
                caseLevel: '',
                caseFirst: '',
                numericOrdering: '',
                alternate: '',
                maxVariable: '',
                backwards: '',
                normalization: '',
            },
            collectionName: '',
            errors: {
                collectionName: ''
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
    mounted() {
        this.$refs['collectionName'].focus();
    },
    methods: {
        customLabel (option) {
            return `${option.library} - ${option.language}`
        },
        async createCollection() {
            this.errors.collectionName = null;

            const validateNameRes = await this.validateCollectionName(this.collectionName);
            if (!validateNameRes.result.canCreate) {
                this.errors.collectionName = validateNameRes.result.reason
            } else {
                alert('create collection');

                this.collectionName = '';
                this.errors.collectionName = null;
            }
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