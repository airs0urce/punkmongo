<template>
  <div>
    <div class="query-editor">
      <div class="filter-wrapper" :class="{'filter-invalid': !this.filter.valid}">
        <AceEditor
          width="500px"
          mode="mongodb"
          theme="mongodb"
          :minLines="3"
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
      <br/>
      Sort:
      <vue-tags-input
        v-model="sort.tag"
        :tags="sort.tags"
        :add-on-key="[13, ' ']"
        :validation="sort.validate"
        :autocomplete-items="sort.autosuggestSortFields"
        @tags-changed="newTags => sort.tags = newTags"
        placeholder="Add field"
      />   

      <button>Submit Query</button>
      <button>Explain</button>

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
          tags: [],
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
  display: inline-block;
  border: 1px solid #BBB;
  overflow: hidden;
  &.filter-invalid .ace_editor {
    background-color: #fdefef;  
  }
}

div.query-editor {
  border: 2px #ccc solid;
  background-color: rgb(238, 239, 255);
  padding: 0.5em;
}
</style>








