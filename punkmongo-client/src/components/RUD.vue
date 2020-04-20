<template>
  <div>

    <div class="query-editor">

      <div class="filter-row-wrapper" :class="{'filter-invalid': !this.query.filter.valid}">
        
        <!-- <div class="filter-label">filter</div> -->
        <!-- <div class="options-label">options</div> -->
        <div class="filter-content-left">
          <div>filter</div>
          <AceEditor
            width="500px"
            mode="mongodb"
            theme="mongodb"
            :cursorStart="2"
            :minLines="4"
            :maxLines="40"
            :fontSize="11"
            :showPrintMargin="true"
            :showGutter="false"
            :highlightActiveLine="false"
            :enableBasicAutocompletion="false" 
            :enableLiveAutocompletion="true"
            :onChange="onChange"
            name="mongo-query-editor"
            :value="this.query.filter.text"
            :editorProps="{$blockScrolling: Infinity}"
          />
          <div class="sort-and-limit query-row-margin">
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
                :class="{'empty-value': isValueEmpty('query.sort')}"
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
                :class="{'empty-value': isValueEmpty('query.projection')}"
              />   
            </div>
            <div>
              <div>limit</div>
              <input type="number" 
                class="field-limit" 
                min="0"
                placeholder="∞"
                v-model.number="query.limit" 
                :class="{'empty-value': isValueEmpty('query.limit')}"
              />
            </div>
          </div>

          <div class="filter-row-wrapper footer">
            <div class="submit-area">
              <button @click="querySubmit">Submit query</button>
              <button @click="resetConditions">Clear Conditions</button>
              <Loader v-if="loading" />  
            </div>
            <div class="rows-and-cost">
              <div class="cost-value" v-if="explain">cost: {{explain.executionStats.executionTimeMillis / 1000}} sec</div>
            </div>
          </div>
        </div>
        <div class="query-options">
          <div>
            <div>timeout</div>
            <input type="number" 
              min="0"
              placeholder="∞" 
              class="timeout-input" 
              v-model.number="query.timeout" 
              :class="{'empty-value': isValueEmpty('query.timeout')}"
            /> sec
          </div>
          <div class="query-row-margin">
            <div>hint</div>
            <select class="hint-select" v-model.number="query.hint" :class="{'empty-value': isValueEmpty('query.hint')}">
              <option>10</option>
              <option>30</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div class="query-row-margin">
            <div>rows per page</div>
            <select class="logs-per-page-select" v-model.number="query.pagination.pageSize">
              <option>10</option>  
              <option>30</option>  
              <option>50</option>  
              <option>100</option>  
              <option>500</option>  
              <option>1000</option>  
              <option>2000</option>
              <option>5000</option>
              <option>10000</option>
            </select>
          </div>
        </div>
      </div>
      
    </div>

    <div v-if="explain">
      <div class="gap"></div>
      <div>
        Explain: 
        <AceEditor
          width="100%"
          mode="mongodb"
          theme="mongodb"
          :name="'mongo-explain'"
          :minLines="4"
          :maxLines="10"
          :fontSize="11"
          :showPrintMargin="false"
          :showGutter="true"
          :value="JSON.stringify(explain)"
          :editorProps="{$blockScrolling: Infinity}"
          :readOnly="true"
          :highlightActiveLine="false"
          :enableBasicAutocompletion="false" 
          :enableLiveAutocompletion="false"
          :hideCursorLayer="true"
        />
      </div>



      <div class="gap"></div>
      <div class="pagination">
        <div><button>Go to page</button> <input type="" name="" style="width: 4em;"></div> 

        <div>First | 1 | 2 | 3 | 4 | 5 | Last</div>
        
      </div>
      <div class="gap"></div>

      <div v-for="(record, index) in records" class="document">
        <div class="document-header">
          <router-link :to="''">Update</router-link>
          <router-link :to="''">Delete</router-link>
          <router-link :to="''">Refresh</router-link>
          <router-link :to="''">Expand</router-link>
          <router-link :to="''">Expand All</router-link>

          Timestamp: {{recordsTimestamps[index]}}
        </div>
        <div>
          
          <AceEditor
            width="100%"
            mode="mongodb"
            theme="mongodb"
            :name="`mongo-record-viewer-${index}`"
            :minLines="4"
            :maxLines="10"
            :fontSize="11"
            :showPrintMargin="false"
            :showGutter="true"
            :value="record"
            :editorProps="{$blockScrolling: Infinity}"
            :readOnly="true"
            :highlightActiveLine="false"
            :enableBasicAutocompletion="false" 
            :enableLiveAutocompletion="false"
            :hideCursorLayer="true"
          />
        </div>
      </div>
    </div>
<!-- 
После запроса уидать его в фон и показывать статистику выполнения:
Time: 2,345 ms / 5 sec / 1 min
hrtime
!!!!!!!!!! Перейти полностью на Websocket !!!!!!!!!!!!!! -->
   
  </div>

</template>



<script>
import * as mongodbQueryParser from 'mongodb-query-parser';
import VueTagsInput from '@johmun/vue-tags-input';
import { Ace as AceEditor, Split as SplitEditor } from 'vue2-brace-editor';
import 'mongodb-ace-mode';
import 'mongodb-ace-theme';
import * as actions from '../store/actions';
import api from '../api/api'
import Loader from './Loader'
import * as a from 'awaiting'
import * as moment from 'moment'
import { EJSON } from 'bson'


function getDefaultData() {
  return {
    loading: false,
    query: {
      filter: {
        text: `{\n  \n}`,
        valid: true,
      },
      sort: {
        tag: '',
        tags: [{text: '_id:-1'}],
        autocompleteItems: [
          {text: '_id:1'},
          {text: '_id:-1'},  
        ],
        validate: [
          {
            classes: 'field-with-direction', 
            disableAdd: true,
            rule: ({ text }) => {
              const invalid = (text.slice(-3) !== ':-1' && text.slice(-2) !== ':1');
              return invalid;
            }
          },
        ]
      },
      projection: {
        tag: '',
        tags: [],
        autocompleteItems: [
          {text: '_id:1'},
          {text: '_id:-1'},  
        ],
        validate: [
          {
            classes: 'field-with-include-flag', 
            disableAdd: true,
            rule: ({ text }) => {
              const invalid = (text.slice(-2) !== ':0' && text.slice(-2) !== ':1');
              return invalid;
            }
          },
        ]
      },

      limit: '',
      timeout: '',
      pagination: {pageSize: 10, pageNumber: 1},
      hint: ''
    },
    records: [],
    recordsTimestamps: [],
    explain: null
  }
}

export default {
    components: {
      AceEditor,
      VueTagsInput,
      Loader,
    },
    data: getDefaultData,
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
        return this.$store.state.activeDb.name;
      },
      activeCollectionName() {
        return this.$store.state.activeDb.activeCollection;
      },
    },
    watch: {
      query: {
        handler: function() {
          if (this.query.limit <= 0) {
            this.query.limit = '';
          }
          if (this.query.timeout <= 0) {
            this.query.timeout = '';
          }
          
        },
        deep: true
      },
      activeDbName: function() {
        this.querySubmit();
      },
      activeCollectionName: function(newVal, oldVal) {
        if (newVal != oldVal) {
          this.resetQueryInterface();
          this.records = [];
          this.recordsTimestamps = [];
          this.querySubmit();
        }
      }
    },
    methods: {
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

        if (!this.activeDb.name || !this.activeDb.activeCollection) {
          return;
        }

        this.loading = moment().valueOf();

        const sort = {};
        if (this.query.sort.tags.length > 0) {
          for (let tag of this.query.sort.tags) {
            const [field, dir] = tag.text.split(':')
            sort[field] = parseInt(dir, 10);
          }
        }

        const projection = {};
        if (this.query.projection.tags.length > 0) {
          for (let tag of this.query.projection.tags) {
            const [field, dir] = tag.text.split(':')
            projection[field] = parseInt(dir, 10);
          }
        }
        
        const response = await api.request('collectionQuery', {
          db: this.activeDb.name,
          collection: this.activeDb.activeCollection,
          query: {
            filter: this.query.filter.text, 
            options: {
              sort: sort, 
              projection: projection,
              limit: this.query.limit || false, 
              timeout: this.query.timeout || false, 
            },
            pagination: {pageSize: this.query.pagination.pageSize, pageNumber: this.query.pagination.pageNumber}
          }
        });
        if (! response.error) {
          this.records = response.records;
          this.explain = response.explain;

          this.records = response.records.map((record) => {
            var obj = EJSON.parse(record);
            return mongodbQueryParser.toJSString(obj, '    ');
          });
          this.recordsTimestamps = response.recordsTimestamps;
        } else {
          this.records = [];
          this.recordsTimestamps = [];
        }

        const diff = moment().valueOf() - this.loading;
        if (diff < 200) {
          await a.delay(200 - diff);
        }
        
        this.loading = false;
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
      resetQueryInterface() {
        Object.assign(this.$data, getDefaultData())
      },
      resetConditions() {
        const defaultData = getDefaultData()
        delete defaultData.records
        delete defaultData.recordsTimestamps
        delete defaultData.explain
        Object.assign(this.$data, defaultData)
      }
    },
}
</script>

<style lang="scss" scoped>
.query-editor {
  padding: 1rem 0.8rem 0.4rem;
  background-color: rgb(238, 239, 255);
}
.filter-row-wrapper {
  display: flex;
  align-items: flex-start;
  overflow: hidden;
  margin-bottom: 0.3rem;
  
  // padding: 1rem 0.4rem 0.4rem;
  position: relative;
  &.filter-invalid .ace_editor {
    background-color: #fdefef;  
  }
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
    width: 500px;
    justify-content: space-between;
    margin-top: 1.2rem;
    .rows-and-cost {
      > div {
        display: inline-block;
        margin-left: 1rem;
      }
    }
    button {
      width: 9rem;
    }
    
  }

  // .options-label {
  //   display: inline-block;
  //   position: absolute;
  //   top: 1px;
  //   left: 515px;
  //   font-size: 0.8rem;
  //   font-weight: 200;
  //   color: #c7c8d2;
  //   user-select: none;
  //   font-family: Verdana;
  // }
}
/deep/ {
  .ace_scroller {
    border: 1px solid #ddd;
  }
  .ace-mongodb {
    background: #fff;
  }
  .ti-new-tag-input-wrapper {
    font-size: 1rem;
  }
  .vue-tags-input  {
    width: 17.2rem;
    background-color: #fff;
    .ti-input {
      border: 1px solid #ddd;
      padding: 2px;
    }
    .ti-new-tag-input {
      font-family: 'Courier New';
      background-color: #c8f7c8;
      color: #0a420a;
      // outline: 0.3rem solid #c8f7c8;
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
  width: 6rem;
}

.sort-and-limit {
  display: flex;
  justify-content: space-between;
}
.filter-content-left {
  border-right: 2px solid #cecef94a;
  padding-right: 1rem;
}
.sort_params_input, .projection_params_input {
  user-select: none;
}
.submit-area {
  display: flex;
  align-items: center;
}
.submit-area > * {
  margin-right: 0.5rem;
}

.logs-per-page-select,
.timeout-input,
.hint-select {
  width: 8rem;
}

div.document {
  border: 2px #ccc solid;
  margin-bottom: 1em;
  &:hover {
    background-color: rgb(238, 239, 255);
  }
}
.empty-value, .empty-value /deep/ input {
  background-color: #eee !important;
  color: #aaa;
}

/deep/ .ti-new-tag-input-wrapper input {
  min-width: fit-content;
}

.query-row-margin {
  margin-top: 0.5rem;
}

.document-header {
  border-bottom: 2px solid #ccc;
  a {
    border-right: 1px solid #ccc;
    padding: 0.5em;
    display: inline-block;
  }
}

</style>








