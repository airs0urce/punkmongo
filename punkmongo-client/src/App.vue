<!-- <router-link to="/">Home</router-link> |
<router-link to="/about">About</router-link> -->

<template>
    <div class="main-container" @mousemove="onMouseMove" @mouseup="disableResizerMoving" :class="{'error-padding': $store.state.errors.global}">

        <span class="global-error-close" v-if="$store.state.errors.global" @click="closeError()"><font-awesome-icon icon="times" /></span>
        <div class="global-error" v-if="$store.state.errors.global">
            <div class="error-wrapper">
                <span class="message">{{$store.state.errors.global}}</span>
            </div>
        </div>
        <div class="left-panel" :style="{flex: '0 0 ' + $store.state.persistent.resizerPosition + 'px', width: $store.state.persistent.resizerPosition + 'px'}" v-if="$store.state.persistent.showLeftPanel">
            <div class="left-panel-header no-select">
                <router-link class="left-panel-header-link overview-server" to="/overview/server-info">Server</router-link>
                <router-link class="left-panel-header-link overview-databases" to="/overview/databases">Databases</router-link>
                <router-link class="left-panel-header-link settings" to="/settings">Settings</router-link>
            </div>
            <div class="left-panel-scroll">
                <!-- <div class="line" /> -->
                <div class="left-panel-scroll-padding">
                    <DatabasesNavigation />
                </div>
            </div>
        </div>
        <div class="split-adjust-handler" 
            @mousedown="enableResizerMoving" 
            :class="{hover: movingResizer, 'left-panel-hidden': !$store.state.persistent.showLeftPanel}"
            ></div>
        <div class="right-panel">
            <div class="padding">
                <div class="content">
                    <router-view />
                </div>
            </div>
        </div>
    </div>
</template>

<script type="text/javascript">

import '@/assets/css/reset.css'
import '@/assets/css/main.css'
import DatabasesNavigation from '@/components/DatabasesNavigation'
import * as mutations from './store/mutations'
import * as actions from './store/actions'
import eventBus from './eventBus'
import utils from './utils'



export default {
    components: {
        DatabasesNavigation,

    },

    data: function() {
        return {
            movingResizer: false,
            leftPanelSizeLimits: {
                min: 220,
                max: 600
            },
            showLeftPanel: true
        }
    },
    mounted() {
        const pressActiveClass = 'press-active';
        const tagClassDelay = {
            'BUTTON': 200,
            'A': 60
        };
        document.addEventListener("mousedown", e => {
            const parent = e.target.parentNode;
            
            if (tagClassDelay[e.target.tagName] || (parent && tagClassDelay[parent.tagName])) {
                let target = null;
                if (tagClassDelay[e.target.tagName]) {
                    target = e.target;
                } else {
                    target = parent;
                }

                target.classList.add(pressActiveClass);
                setTimeout(() => {
                    target.classList.remove(pressActiveClass);
                }, tagClassDelay[target.tagName]);
            }
        })

        eventBus.$on('load-database', async (dbName) => {
            this.loadDatabase(dbName);
        });
        this.loadDatabase(this.$route.params.dbName);

        this.$router.afterEach((to, from) => {

            this.$store.commit(mutations.SET_PREVIOUS_ROUTE, {
                fullPath: from.fullPath,
                name: from.name,
                path: from.path,
                params: from.params,
            });
        })
    },
    methods: {
        enableResizerMoving(event) {
            this.movingResizer = true;
            this.movingStartPos = event.clientX;
        },
        onMouseMove(event) {
            const persistent = this.$store.state.persistent;
            let resizerPosition = 0;
            if (this.movingResizer) {
                resizerPosition = event.clientX;

                if (resizerPosition < 30 && persistent.showLeftPanel) {
                    this.toggleLeftPanel();
                } else if (resizerPosition > 30 && !persistent.showLeftPanel) {
                    this.toggleLeftPanel();
                    resizerPosition = 0;
                } else {
                    if (resizerPosition > this.leftPanelSizeLimits.max) {
                        resizerPosition = this.leftPanelSizeLimits.max;
                    }
                    if (resizerPosition < this.leftPanelSizeLimits.min && persistent.showLeftPanel) {
                        resizerPosition = this.leftPanelSizeLimits.min;
                    }
                }

                this.$store.commit(mutations.SET_RESIZER_POSITION, resizerPosition);
                utils.removeDocumentSelection();
            }

        },
        disableResizerMoving(event) {
            this.movingResizer = false;
            const movingEndPos = event.clientX;
            if (this.movingStartPos == movingEndPos) {
                this.toggleLeftPanel();
            }
        },
        toggleLeftPanel() {
            this.$store.commit(mutations.TOGGLE_LEFT_PANEL);
            if (this.$store.state.persistent.resizerPosition < this.leftPanelSizeLimits.min) {
                this.$store.commit(mutations.SET_RESIZER_POSITION, this.leftPanelSizeLimits.min);
            }
        },
        async loadDatabase(dbName) {
            if (this.$store.state.loadingDb == dbName) {
                return;
            }

            await this.$store.dispatch(actions.ACTION_LOAD_DB, dbName);
        },
        closeError() {
            this.$store.commit(mutations.SET_ERROR, {error: null});
        }

    }
}
</script>

<style lang="scss">
html, body, button {
    font-size: 12px;
    /* font-family:"Courier New", Arial; */
    /* text-rendering: geometricPrecision; */
    font-family: "Akzidenz", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

a {
    text-decoration: none;
    color: #004499;
    outline: none;
    cursor: pointer;
}
a,
a:active,
a:focus {
    outline: none;
}
a:hover {
    color: blue;
}

.main-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    min-height: 100vh;

    &.error-padding {
        padding-top: 8rem;
    }
}
.padding {
    padding: 1rem;
}

$left-panel-header-height: 2.7rem;

.left-panel {
    background-color: #eeefff;
    white-space: nowrap;
    .left-panel-header {
        overflow: hidden;
        width: 100%;
        background-color: #ddd;
        border-bottom: 1px solid #bbb;
        padding: 0.8rem 0.5rem 0 0.5rem;
        height: $left_panel_header_height;
    }
    .left-panel-scroll-padding {
        padding-top: 1rem;
        padding-bottom: 2rem;
    }
    .left-panel-scroll {
        overflow: auto;
        height: calc(100vh - #{$left-panel-header-height});
    }
}

.line {
    margin-bottom: 1rem;
    border-bottom: 1px #ccc solid;
}
.split-adjust-handler {
    height: 100vh;
    flex: 0 0 0.7rem;
    background-color: #ddd;
    border: 1px solid #bbb;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:hover,
    &.hover {
        background-color: #c4e1a4;
        cursor: pointer;
    }
    &.left-panel-hidden {
        flex: 0 0 1.2rem;
    }
}

.right-panel {
    flex-grow: 1;
    height: 100vh;
    overflow: auto;
    padding-bottom: 1.5rem;
    min-width: 70rem;
}
.right-panel .line {
    border-bottom-color: #999;
}

table {
    background-color: rgb(204, 204, 204);
    border-collapse: separate;
    border-spacing: 1px;
    thead .bold {
        font-weight: bold;
    }
    th {
        background-color: #e2e1e1;
        font-weight: bold;
        padding: 0.5rem;
        text-align: center;
        vertical-align: middle;
    }
    tr.totals th {
        background-color: #eee;
        font-weight: normal;
    }
    td {
        background-color: #fffeee;
        padding: 0.3rem;
    }
    tfoot td {
        font-weight: bold;
    }
}

div.gap {
    height: 1rem;
}

.left-panel-header-link {
    padding-left: 1.6rem;
    padding-bottom: 0.2rem;
    background-size: 13px;
    background-position: 0px 0.5px;
    &.overview-server {
        background: url("./assets/imgs/world.png") no-repeat;
        margin-right: 0.5rem;
    }
    &.overview-databases {
        background: url("./assets/imgs/database.png") no-repeat;
        margin-right: 0.5rem;
    }
    &.settings {
        background: url("./assets/imgs/settings.png") no-repeat;
    }
}

.vue-tab[aria-selected="true"] {
    background-color: #eeefff;
}
input {
    padding: 0.542em;
    background-color: #fff;
    border: 1px solid #ddd;
    &:focus {
        outline: 0;
    }
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type=number] {
    -moz-appearance: textfield;
}

button {
    line-height: inherit;
    user-select: none;
    padding: 0.542em 1.5rem;
    font-size: 1rem;
    
    position: relative;
    box-shadow: none;
    background-color: #fff;
    color: #555;
    cursor: default;
    border: 1px solid #ddd;
    border-radius: 3px;
    white-space: nowrap;
    &:active,
    &.press-active {
        background-color: #fdffee;
        top: 1px;
        box-shadow: none;
    }
    &:focus {
        outline: 0;
    }
    &.btn-icon {
        padding-left: 1.3rem;    
    }
    &.btn-red {
        color: #ab5858;
        background-color: #fff2f2;
        border: 1px solid #e4b5b5;
    }
    &[disabled] {
        color: #bfbfbf;
        background-color: #f1f1f1;
        border: 1px solid #f1f1f1;
    }
}

a.button {
    display: inline-block;
    vertical-align: bottom;
    user-select: none;
    padding: 0.542em 1.5rem;
    font-size: 1rem;
    position: relative;
    box-shadow: none;
    background-color: #fff;
    color: #555;
    cursor: default;
    border: 1px solid #ddd;
    border-radius: 3px;
    white-space: nowrap;
    &:active,
    &.press-active {
        background-color: #fdffee;
        top: 1px;
        box-shadow: none;
    }
    &:focus {
        outline: 0;
    }
    &.btn-icon {
        padding-left: 1.3rem;    
    }
    &.btn-red {
        color: #a23a3a;
        background-color: #ffecec;
        border: 1px solid #a23a3a;
    }
    &[disabled] {
        color: #848484;
        background-color: #fbfbfb;
        border: 1px solid #848484;
    }
}


select {
    padding: 0.542em 2em 0.542em 0.542em;
    border: 1px solid #ddd;
    border-radius: 0;
    appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, gray 50%),
        linear-gradient(135deg, gray 50%, transparent 50%);
    background-position: calc(100% - 14px) 1em, calc(100% - 10px) 1em,
        calc(100% - 2.5em) 0.5em;
    background-size: 5px 5px, 5px 5px, 1px 1.5em;
    background-repeat: no-repeat;
    text-overflow: ellipsis;
    overflow: hidden;
}

.full-width-table {
    min-width: 700px;
    width: 100%;
}

.ace_content {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}

.mongo-query-editor {
    width: 100%;
    max-height: 30em;
    min-height: 4.7em;
    white-space: nowrap !important;
    border: 1px solid #ddd;
    background: #fff;
    font-family: Courier;
    font-size: 1.1em;
    line-height: 1.3rem;
    padding-left: 2px;
    padding-top: 2px;
    padding-bottom: 2px;
}

.ti-tag {
    font-size: 1rem !important;
}


.language-mongodb-document,
.language-mongodb-aggregation,
.language-mongodb-update,
.language-mongodb-filter {
    line-height: 1.3em;
}

.nowrap {
    white-space: nowrap;
}
* {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    -webkit-app-region: no-drag; 
}
.no-select {
    user-select: none;
}
.with-select {
    user-select: text;
}

.arrow-separator {
    color: #bbb;
    margin: 0 0.5em;
}
strong {
    font-weight: bold;
}
.light {
    color: #777;
}
.lighter {
    color: #aaa;
}
.page-header {
    font-size: 1.5em;
    margin-bottom: 1em;
}

.global-error-close {
    cursor: pointer;
    font-size: 1.5em;
    position: fixed;
    top: 0.2em;
    left: 0.3em;
    z-index: 101;
    &:hover {
        color: #444;
    }
}

.global-error {
    user-select: text;
    position: fixed;
    height: 8rem;
    top: 0;
    overflow: auto;
    z-index: 100;
    background: #f9bdbd;
    width: 100%;
    padding: 0.7em 1em;
    color: #3e1111;
    border-bottom: 4px solid #e4a6a7;
    &.top-gap {
        margin-top: 1rem;
    }
    &.bottom-gap {
        margin-bottom: 1rem;
    }
    .error-wrapper {
        padding-left: 1em;
        white-space: pre-wrap;
    }
    a {
        text-decoration: underline;
    }
}

.local-notice {
    user-select: text;
    overflow: auto;
    background: #d2ecff;
    width: 100%;
    padding: 0.7em 1em;
    color: #163c58;
    border-bottom: 4px solid #a6c9e4;
    &.top-gap {
        margin-top: 1rem;
    }
    &.bottom-gap {
        margin-bottom: 1rem;
    }
    a {
        text-decoration: underline;
    }
}
.local-error {
    user-select: text;
    overflow: auto;
    background: #f9bdbd;
    width: 100%;
    padding: 0.7em 1em;
    color: #3e1111;
    border-bottom: 4px solid #e4a6a7;

    &.top-gap {
        margin-top: 1rem;
    }
    &.bottom-gap {
        margin-bottom: 1rem;
    }
    a {
        text-decoration: underline;
    }
}
.local-error-text {
    user-select: text;
    color: #d80808;
    position: static;
    display: inline;
    margin-left: 0.5em;
    margin-top: 0;
    a {
        text-decoration: underline;
    }
}
.local-info-text {
    position: static;
    display: inline;
    margin-left: 0.5em;
    margin-top: 0;
    user-select: text;
    color: #777;
    a {
        text-decoration: underline;
    }
}


form {
    border-radius: 0.5em;
    border: 1px solid #eee;
    padding: 1em;
    .form-row {
        display: block;
        margin-bottom: 1rem;
    }
    .form-row-padding {
        display: block;
        margin-bottom: 1rem;
        margin-left: 1.5rem;
    }
    .form-row-last {
        padding-top: 1em;
        margin-bottom: 0;   
    }
    .field-name {
        display: block;
        margin-bottom: 0.3em;
    }
    .error {
        color: #960505;
    }
}

h1 {
    font-size: 1.5em;
    margin-bottom: 1em;
}
h2 {
    font-size: 1.3em;
    margin-bottom: 1em;
}
h3 {
    font-size: 1.1em;
}
input[type="checkbox"]:focus, input[type="radio"]:focus {
    outline: 1px solid #eee;
}

.info-tag {
    background-color: #6c757d;
    cursor: default;
    color: #fff;
    border-radius: 2px;
    display: inline-block;
    padding: 3px 5px;
    font-size: 1rem;
    
    &.info {
        background-color: #17a2b8;
    }
    &.disabled {
        background-color: #e8e8e8;
        color: #929292;
    }
}

.icon-help {
    color: #aaa;
    margin-left: 0.5em;
    &:hover {
        color: #888;
    }
}

.svg-inline--fa {
    height: 0.95em;
}
button .svg-inline--fa {
    margin-right: 0.2em;
}

.empty-value,
.empty-value /deep/ input {
    background-color: #eee !important;
    color: #aaa;
}

.reset-btn {
    margin-left: 0.5em;
    color: #888;
    cursor: pointer;
}


.action-buttons {
    display: flex;
    justify-content: space-between;
    .action-buttons-left button, .action-buttons-left a.button {
        margin-right: 1em;
    }
    .action-buttons-right button, .action-buttons-right a.button {
        margin-left: 1em;
    }
}
.delete-icon {
    color: #ab6e6e;    
    &:hover {
        color: #c54e4e;
    }
}
.td-delete {
    text-align: center;
}
.td-rename {
    text-align: center;
}

a svg.light.svg-inline--fa {
    color: #777;
    &:hover {
        color: #555;
    }    
}

table.zebra tr:nth-child(even) td {
  background-color: #fffeede0;
}
.text-center {
    text-align: center;
}
</style>






