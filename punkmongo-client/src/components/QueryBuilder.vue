<template>
  <div>

    <div class="query-editor">

      <div class="filter-wrapper" :class="{'filter-invalid': !this.filter.valid}">
        
        <!-- <div class="filter-label">filter</div> -->
        <!-- <div class="options-label">options</div> -->
        <div>
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
            name="editor"
            :value="this.filter.text"
            :editorProps="{$blockScrolling: Infinity}"
          />
        </div>
        <div class="query-options">
          <div>
            <div>sort</div>
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
            <div>limit</div>
            <input type="number" name="" />
          </div>
          <div>
            <div>projection</div>
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
          <div>
            <div>rows per page</div>
            <select name="" >
              <option>10</option>  
              <option>30</option>  
              <option>50</option>  
              <option>100</option>  
              <option>500</option>  
              <option>1000</option>  
              <option>2000</option>  
            </select>
          </div>
        </div>
      </div>
      
      <div></div>
      

      <div>
        <button>Submit Query</button>
        <button>Explain</button>
      </div>

      Cost: 33ms  

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
  .query-options {
    padding-left: 1em;
    > div {
      margin-bottom: 0.3em;
    }
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


  // .options-label {
  //   display: inline-block;
  //   position: absolute;
  //   top: 1px;
  //   left: 515px;
  //   font-size: 0.8em;
  //   font-weight: 200;
  //   color: #c7c8d2;
  //   user-select: none;
  //   font-family: Verdana;
  // }
}
/deep/ .ace_scroller {
  border: 1px solid #ddd;
}
/deep/ .vue-tags-input  {
  width: 25em;
  background-color: #f5f6f7;
  .ti-input {
    border: 1px solid #ddd;
    padding: 2px;
  }
  .ti-new-tag-input {
    background-color: #c8f7c8;
    color: #0a420a;
    // outline: 0.3em solid #c8f7c8;
  }
  .ti-invalid {
    background-color: #f5f6f7;
  }
}




</style>








