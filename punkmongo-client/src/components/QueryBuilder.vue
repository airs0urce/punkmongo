<template>
  <div>

    <div class="query-editor">

      <div class="filter-wrapper" :class="{'filter-invalid': !this.filter.valid}">
        <div class="filter-label">filter</div>
        <div class="options-label">options</div>
        <div>
          <AceEditor
            width="500px"
            mode="mongodb"
            theme="mongodb"
            :minLines="4"
            :maxLines="20"
            :fontSize="11"
            :showPrintMargin="true"
            :showGutter="false"
            :highlightActiveLine="false"
            :enableBasicAutocompletion="false" 
            :enableLiveAutocompletion="true"
            :onChange="onChange"
            name="editor"
            :value="this.filter.text"
            :editorProps="{$blockScrolling: Infinity}"
          />
        </div>
        <div class="sort-and-projection">
          <div>
            Sort
            <vue-tags-input
              v-model="sort.tag"
              :tags="sort.tags"
              :add-on-key="[13, ' ']"
              :validation="sort.validate"
              :autocomplete-items="sort.autosuggestSortFields"
              @tags-changed="newTags => sort.tags = newTags"
              placeholder="Add field"
            />
          </div>
          <div>
            Project
            <vue-tags-input
              v-model="projection.tag"
              :tags="projection.tags"
              :add-on-key="[13, ' ']"
              :validation="projection.validate"
              :autocomplete-items="projection.autosuggestSortFields"
              @tags-changed="newTags => projection.tags = newTags"
              placeholder="Add field"
            />   
          </div>
        </div>
      </div>
      
      
      
      <div></div>
      Limit <input type="number" name="" />
      Rows 
      <select name="" >
        <option>10</option>  
        <option>30</option>  
        <option>50</option>  
        <option>100</option>  
        <option>500</option>  
        <option>1000</option>  
        <option>2000</option>  
      </select>

      <div>
        <button>Submit Query</button>
        <button>Explain</button>
      </div>

      Cost: 33ms  


      DISTINCT!!!
    </div>
    
     
  </div>
</template>

<script>
import * as mongodbQueryParser from 'mongodb-query-parser'
import VueTagsInput from '@johmun/vue-tags-input';
import brace from 'brace';
import { Ace as AceEditor, Split as SplitEditor } from 'vue2-brace-editor';
import 'mongodb-ace-mode'
import 'mongodb-ace-theme';


export default {
    components: {
      AceEditor,
      VueTagsInput,

    },
    data: function() {
      return {
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
        }
        
      }
    },
    computed: {
      autosuggestSortFields() {
        return this.autocompleteItems.filter(i => {
          return i.text.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
        });
      },
    },
    methods: {
      onChange(newValue) {
        this.filter.text = newValue;
        this.filter.valid = this.isFilterValid(this.filter.text);
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
    }
}
</script>

<style lang="scss" scoped>
.filter-wrapper {
  display: flex;
  overflow: hidden;
  &.filter-invalid .ace_editor {
    background-color: #fdefef;  
  }
  .sort-and-projection {
    padding-left: 1em;
  }
  .vue-tags-input {
    display: inline-block;
  }
  .filter-label {
    display: inline-block;
    position: absolute;
    top: 1px;
    left: 1em;
    font-size: 0.8em;
    font-weight: 200;
    color: #c7c8d2;
    user-select: none;
    font-family: Verdana;
  }
  .options-label {
    display: inline-block;
    position: absolute;
    top: 1px;
    left: 515px;
    font-size: 0.8em;
    font-weight: 200;
    color: #c7c8d2;
    user-select: none;
    font-family: Verdana;
  }
}


</style>








