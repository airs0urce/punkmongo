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
    import Prism from '@/vendor/prismjs/prism.js';
    import '@/vendor/prismjs/prism.css'
    import CodeJar from '@/components/CodeJar';
    import {EJSON} from 'bson';
    import api from '@/api/api';

    export default {
        components: {
            CodeJar
        },
        data: function() {

            const doc = `{\n  \n}`;

            return {
                loading: false,
                doc: doc,
                msgError: '',
                msgInfo: '',
            }
        },
        computed: {
            activeDb() {
                return this.$store.state.activeDb;
            },
            activeCollectionName() {
                return this.activeDb.activeCollection.name;
            },
        },
        methods: {
            async insertDocument() {
                this.msgError = '';
                this.msgInfo = '';

                this.loading = true;

                const response = await api.request('insertDocument', {
                    db: this.activeDb.name,
                    collection: this.activeDb.activeCollection.name,
                    doc: this.doc,
                });

                this.loading = false;

                if (response.error) {
                    this.msgError = `${response.error.message}`;
                } else {
                    this.msgInfo = `Successfully inserted. ID of new record is ${response.result.insertedId}`;
                }
            }
        },
        mounted: function() {

        }
}


</script>

<style lang="scss">
.mongodb-document-input {
    // height: 20em;
    // border-radius: 6px;
    // box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    // font-family: 'Source Code Pro', monospace;
    // font-size: 14px;
    // font-weight: 400;
    // height: 340px;
    // letter-spacing: normal;
    // line-height: 20px;
    // padding: 10px;
    // tab-size: 4;
}
</style>