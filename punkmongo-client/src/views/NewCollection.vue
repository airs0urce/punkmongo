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
                <input type="text" ref="collectionName" class="collection-name" v-shortkey="['enter']" @shortkey="createCollection()" />
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
                <label><input v-model="userCustomCollation" type="checkbox" /> Use Custom Collation</label>
                <a href="https://docs.mongodb.com/master/reference/collation/" target="_blank">
                    <font-awesome-icon icon="question-circle" class="icon-help" /> 
                </a>
            </div>
            <div v-if="userCustomCollation">
                <div class="form-row-padding">
                    <label class="field-name" for="collation-locale">Locale:</label>
                    <select id="collation-locale">
                        <option>Test</option>
                    </select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-strength">Strength:</label>
                    <select id="collation-strength"></select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-use-case-level">Use Case-Level:</label>
                    <select id="collation-use-case-level"></select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-case-first">Case First:</label>
                    <select id="collation-case-first"></select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-numeric-ordering">Numeric Ordering:</label>
                    <select id="collation-numeric-ordering"></select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-alternate">Alternate:</label>
                    <select id="collation-alternate"></select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-max-variable">Max-Variable:</label>
                    <select id="collation-max-variable"></select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-backwards">Backwards:</label>
                    <select id="collation-backwards"></select>
                </div>
                <div class="form-row-padding">
                    <label class="field-name" for="collation-normalization">Normalization:</label>
                    <select id="collation-normalization"></select>
                </div>    
            </div>
            
        </form>
        <div class="gap"></div>
        <button @click="createCollection()">Create Collection</button>
        

    
    </div>
</template>

<script>

export default {
    data: function() {
        return {
            cappedCollection: false,
            userCustomCollation: false
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
        createCollection() {
            alert('create coll');
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
</style>