<template>
    <div>
        <div v-if="store.persistent.dbList.length == 0">
            Loading databases...
        </div>
        <div v-if="store.persistent.dbList.length > 0">
            <router-link class="new-database no-select" to="/new-database">New database</router-link>
            <ul class="left-panel-dbs">
                <li v-for="db in store.persistent.dbList" :key="db.name">
                    <div class="db-link-wrapper-top" :ref="el => { if (el) intersectRefs[db.name] = el }"></div>
                    <div class="db-link-wrapper">
                        <router-link
                            class="db-link loading-animation"
                            :class="{
                                'loading': showLoadingDb == db.name,
                                'router-link-exact-active': store.activeDb.name == db.name,
                            }"
                            :to="{name: 'database', params: {dbName: db.name}}"
                            @click="onDbLinkClicked"
                            >{{db.name}}</router-link>
                         ({{db.stats.collections}})
                    </div>

                    <div v-if="store.activeDb.name == db.name">
                        <ul class="left-panel-collections">
                            <li v-for="collection in store.activeDb.collections" :key="collection.name" :class="{'view': collection.options.viewOn}">
                                <router-link
                                    :to="{name: 'collection-manager', params: {dbName: store.activeDb.name, collName: collection.name}}"
                                    @mousedown="onCollectionLinkMouseDown(collection.name)"
                                    >{{collection.name}}</router-link>
                                <span v-if="!collection.options.viewOn" :class="{'no-docs': !collection.stats.objects}"> ({{numberWithCommas(collection.stats.objects)}})</span>
                                <span v-if="collection.options.viewOn" class="no-docs"> (on: {{collection.options.viewOn}})</span>
                            </li>
                        </ul>
                        <router-link class="new-collection no-select" :to="{name: 'new-collection', params: {dbName: store.activeDb.name}}">New Collection</router-link>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { useMainStore } from '../stores/main'
import { useRoute } from 'vue-router'
import { ref, watch, computed } from 'vue'
import moment from 'moment'
import { delay } from '../utils'
import eventBus from '../eventBus'
import utils from '../utils'

let dbLoadStartedTs = 0
const loadingDbAnimationMs = 400

export default {
    name: 'databaseNavigation',
    setup() {
        const store = useMainStore()
        const route = useRoute()
        const intersectRefs = ref({})
        return { store, route, intersectRefs }
    },
    data() {
        return {
            showLoadingDb: false,
            lastActiveDbName: '',
            dbIntersectionObserver: null
        }
    },
    computed: {
        loadingDb() {
            return this.store.loadingDb
        },
    },
    watch: {
        async loadingDb(loadingDB) {
            dbLoadStartedTs = moment.now()
            if (loadingDB) {
                this.showLoadingDb = loadingDB
            } else {
                const tookSec = moment.now() - dbLoadStartedTs
                if (tookSec < loadingDbAnimationMs) {
                    let msDelay = loadingDbAnimationMs - tookSec
                    delay(msDelay).then(() => {
                        this.showLoadingDb = false
                    })
                }

                this.$nextTick(() => {
                    this.handleDbIntersectionObserver()
                    this.scrollToActiveDB()
                })
            }
        },
    },
    methods: {
        handleDbIntersectionObserver() {
            if (!this.dbIntersectionObserver) {
                this.dbIntersectionObserver = new IntersectionObserver((entries) => {
                    const target = entries[0].target
                    if (!target) {
                        return
                    }
                    const dbLinkWrapper = target.closest('li').querySelector('.db-link-wrapper')
                    if (entries[0].intersectionRatio === 0) {
                        dbLinkWrapper.classList.add('sticky-active')
                    } else {
                        dbLinkWrapper.classList.remove('sticky-active')
                    }
                }, { threshold: [0, 1] })
            }

            if (this.lastActiveDbName) {
                const oldEl = this.intersectRefs[this.lastActiveDbName]
                if (oldEl) {
                    oldEl.closest('li').querySelector('.db-link-wrapper').classList.remove('sticky-active')
                    this.dbIntersectionObserver.unobserve(oldEl)
                }
            }
            const intersectEl = this.intersectRefs[this.store.activeDb.name]
            if (intersectEl) {
                this.dbIntersectionObserver.observe(intersectEl)
            }
        },
        scrollToActiveDB() {
            const activeDb = document.querySelector('.db-link.router-link-exact-active')
            if (!activeDb) {
                return
            }
            const activeDbTopEl = activeDb.closest('li').querySelector('.db-link-wrapper-top')

            if (activeDbTopEl) {
                if ('' === this.lastActiveDbName) {
                    activeDbTopEl.scrollIntoView({
                        block: 'start',
                    })
                } else {
                    activeDbTopEl.scrollIntoView({
                        block: 'nearest',
                    })
                }
                this.lastActiveDbName = (this.store.activeDb ? this.store.activeDb.name : '')
            }
        },
        numberWithCommas: utils.numberWithCommas,
        onDbLinkClicked() {
            if (this.route.name === 'database') {
                eventBus.emit('load-database', this.route.params.dbName)
            }
        },
        onCollectionLinkMouseDown(collectionName) {
            eventBus.emit('databaseNavigation:collection-mousedown', collectionName)
        }
    },
    async mounted() {
        await this.store.reloadDbList()
    },
}
</script>

<style lang="scss" scoped>
a.new-database {
    background: url("../assets/imgs/add.png") no-repeat;
    background-size: 14px;
    background-position: 0.5rem 0.5px;
    padding-left: 2.2em;
    padding-bottom: 0.3em;
    display: inline-block;
}
a.new-collection {
    background: url("../assets/imgs/add.png") no-repeat;
    background-size: 14px;
    background-position: 0px 0.5px;
    padding-left: 1.7em;
    padding-bottom: 0.3em;
    display: inline-block;
    margin-left: 2.1em;
}

a {
    line-height: 1.5;
}
.left-panel-dbs {
    padding-bottom: 1.5em;
    .left-panel-collections .router-link-active {
        font-weight: bold;
    }
    li {
        line-height: 1.2;
        .db-link-wrapper-top {
            height: 1px;
        }
        .db-link-wrapper {
            padding-left: 0.5rem;
            position: sticky;
            top: 0;
            background-color: #eeefff;

            background: url("../assets/imgs/database.png") no-repeat;
            background-size: 14px;
            background-position: 0.5em 0.5px;

            &.sticky-active {
                border-bottom: 1px solid #ddd;
                background-color: #dcddf9;
            }
            a.db-link {
                padding-left: 1.7em;
                cursor: pointer;
                &:hover {
                    color: blue;
                }
            }
        }
    }
}

ul.left-panel-collections {
    padding-left: 2.1em;
    li {
        padding-left: 1.7em;
        background: url("../assets/imgs/collection.png") no-repeat;
        background-size: 14px;
        margin-bottom: 0;
        &.view {
            background: url("../assets/imgs/view.png") no-repeat;
        }
    }
}

.loading-animation {
    background: linear-gradient(90deg, #eeefff, #dad076);
    background-repeat: no-repeat;
    background-size: 0 100%;
    background-position: 14px 0;
}
.loading-animation.loading {
    transition: background 0.4s ease-out;
    background-size: 100% 100%;
}
.db-link.router-link-exact-active {
    font-weight: bold;
}
.no-docs {
    color: #888;
}
</style>
