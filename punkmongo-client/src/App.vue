<!-- <router-link to="/">Home</router-link> |
<router-link to="/about">About</router-link> -->

<template>
    <div class="main-container" @mousemove="onMouseMove" @mouseup="disableResizerMoving">
        <div class="left-panel" :style="{flex: '0 0 ' + $store.state.persistent.resizerPosition + 'px', width: $store.state.persistent.resizerPosition + 'px'}" v-if="$store.state.persistent.showLeftPanel">
            <div class="left-panel-header no-select">
                <router-link class="left-panel-header-link overview" to="/overview/databases">Overview</router-link>
                <router-link class="left-panel-header-link settings" to="/settings">Settings</router-link>
            </div>
            <div class="left-panel-scroll">
                <!-- <div class="line" /> -->
                <div class="padding">
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
                min: 200,
                max: 600
            },
            showLeftPanel: true
        }
    },
    mounted() {
        eventBus.$on('load-database', async (dbName) => {
            this.loadDatabase(dbName);
        });
        this.loadDatabase(this.$route.params.dbName);
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

    }
}
</script>

<style lang="scss">
html,
body {
    font-size: 12px;
    /* font-family:"Courier New", Arial; */
    /* text-rendering: geometricPrecision; */
    font-family: "Akzidenz", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

a {
    text-decoration: none;
    color: #004499;
    outline: none;
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
}
.padding {
    padding: 0.8rem;
}

$left-panel-header-height: 2.5rem;

.left-panel {
    background-color: #eeefff;
    white-space: nowrap;
    .left-panel-header {
        width: 100%;
        background-color: #ddd;
        border-bottom: 1px solid #bbb;
        padding: 0.8rem;
        height: $left_panel_header_height;
    }
    .left-panel-scroll {
        overflow: auto;
        height: calc(100vh - #{$left-panel-header-height});
        .padding {
            padding-top: 1rem;
            padding-bottom: 2rem;
        }
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
    min-width: 75rem;
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
    height: 20px;
}

.left-panel-header-link {
    padding-left: 1.6rem;
    padding-bottom: 0.2rem;
    background-size: 13px;
    background-position: 0px 0.5px;
    &.overview {
        background: url("./assets/imgs/world.png") no-repeat;
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

button {
    user-select: none;
    font-size: 1rem;
    padding: 0.542em;
    position: relative;
    box-shadow: none;
    background-color: #fff;
    color: #555;
    cursor: default;
    border: 1px solid #ddd;
    white-space: nowrap;
    &:active {
        background-color: #fdffee;
        top: 1px;
        box-shadow: none;
    }
    &:focus {
        outline: 0;
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

button {
    padding-right: 1.5rem;
    padding-left: 1.5rem;
}

.language-mongodb-query {
    line-height: 1.3em;
}

.nowrap {
    white-space: nowrap;
}
a {
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

.arrow-separator {
    color: #bbb;
    margin: 0 0.5em;
}
.collection-header {
    margin-bottom: 1em;
}
</style>








