<template>
  <div>

    <div class="query-editor">

      <div class="filter-row-wrapper" :class="{'filter-invalid': !this.filter.valid}">
        
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
            name="editor"
            :value="this.filter.text"
            :editorProps="{$blockScrolling: Infinity}"
          />
          <div class="sort-and-limit">
            <div>
              <div>sort</div>
              <vue-tags-input
                class="sort_params_input"
                ref="sort_params_input"
                @click.native="sortParamsClicked"
                v-model="sort.tag"
                :tags="sort.tags"
                :add-on-key="[13, ' ']"
                :validation="sort.validate"
                :autocomplete-items="sort.autosuggestSortFields"
                @tags-changed="newTags => sort.tags = newTags"
                placeholder="add"
              />
            </div>
            <div>
              <div>projection</div>
              <vue-tags-input
                class="projection_params_input"
                ref="projection_params_input"
                @click.native="projectionParamsClicked"
                v-model="projection.tag"
                :tags="projection.tags"
                :add-on-key="[13, ' ']"
                :validation="projection.validate"
                :autocomplete-items="projection.autosuggestSortFields"
                @tags-changed="newTags => projection.tags = newTags"
                placeholder="add"
              />   
            </div>
            <div>
              <div>limit</div>
              <input type="number" class="field-limit" min="0" />
            </div>
          </div>

          <div class="filter-row-wrapper footer">
            <div class="submit-area">
              <button>Submit</button>
              <button>Explain</button>
              <span class="rows-wrapper">
                <span>page rows </span>
                <select name="" >
                  <option>10</option>  
                  <option>30</option>  
                  <option>50</option>  
                  <option>100</option>  
                  <option>500</option>  
                  <option>1000</option>  
                  <option>2000</option>  
                </select>
              </span>
            </div>
            <div class="rows-and-cost">
              <div class="cost-value">cost: 33ms</div>
            </div>
          </div>
        </div>
        <div class="query-options">
          Additional options
          <div>
            <div>timeout</div>
            <input type="number" name="" value="60" class="timeout-input" /> sec
          </div>
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
      sortParamsClicked() {
        this.$refs.sort_params_input.$el.querySelector('input').focus();
      },
      projectionParamsClicked() {
        this.$refs.projection_params_input.$el.querySelector('input').focus();
      },
    },
}
</script>

<style lang="scss" scoped>
.query-editor {
  padding: 1em 0.8em 0.4em;
  background-color: rgb(238, 239, 255);
}
.filter-row-wrapper {
  display: flex;
  align-items: start;
  overflow: hidden;
  margin-bottom: 0.3em;
  
  // padding: 1em 0.4em 0.4em;
  position: relative;
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
  &.footer {
    align-items: baseline;
    width: 500px;
    justify-content: space-between;
    margin-top: 0.8em;
    .rows-and-cost {
      > div {
        display: inline-block;
        margin-left: 1em;
      }
    }
    button {
      width: 9em;
    }
    
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
  width: 17.2em;
  background-color: #f5f6f7;
  .ti-input {
    border: 1px solid #ddd;
    padding: 2px;
  }
  .ti-new-tag-input {
    font-family: 'Courier New';
    background-color: #c8f7c8;
    color: #0a420a;
    // outline: 0.3em solid #c8f7c8;
  }
  .ti-invalid {
    background-color: #f5f6f7;
  }
}

/deep/ .ti-tag {
  background-color: #5e87c1;
}

.field-limit {
  width: 6em;
}

.sort-and-limit {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5em;
}
.timeout-input {
  width: 6em;
}
.filter-content-left {
  border-right: 2px solid #cecef94a;
  padding-right: 1em;
}
.sort_params_input, .projection_params_input {
  user-select: none;
}
.submit-area > * {
  margin-right: 0.5em;
}
.rows-wrapper {
  margin-left: 0.65em;
}
</style>








