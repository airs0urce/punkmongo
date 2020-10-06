<template>
    <div>
        <div v-if="state.persistent.dbList.length == 0">
            Loading databases...
        </div>
        <div v-if="state.persistent.dbList.length > 0">
            <router-link class="new-database no-select" :to="'/new-database'">New database</router-link>
            <ul class="left-panel-dbs">
                <li v-for="db in state.persistent.dbList">
                    <div class="db-link-wrapper-top" :ref="'intersect-' + db.name"></div>
                    <div class="db-link-wrapper">
                        <router-link 
                            class="db-link loading-animation" 
                            :class="{loading: showLoadingDb == db.name, 'router-link-exact-active': state.activeDb.name == db.name}"
                            :to="'/db/' + db.name"
                            @click.native="onDbLinkClicked"
                            >{{db.name}}</router-link>
                         ({{db.stats.collections}})
                    </div>

                    <div v-if="state.activeDb.name == db.name">
                        <ul class="left-panel-collections">
                            <li v-for="collection in state.activeDb.collections">
                                <router-link 
                                    :to="'/db/' + state.activeDb.name + '/col/' + collection.name"
                                    @mousedown.native="onCollectionLinkMouseDown(collection.name)"
                                    >{{collection.name}}</router-link>
                                <span :class="{'no-docs': collection.stats.objects == 0}"> ({{numberWithCommas(collection.stats.objects)}})</span>
                            </li>
                        </ul>
                        <router-link class="new-collection no-select" :to="'/db/' + state.activeDb.name + '/new-collection'">New Collection</router-link>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script type="text/javascript">
import * as actions from '../store/actions'
import {
    mapState
} from 'vuex';
import moment from 'moment';
import * as a from 'awaiting';
import eventBus from '../eventBus'
import utils from '../utils'

let dbLoadStartedTs = 0;
const loadingDbAnimationMs = 400;

export default {
    name: 'databaseNavigation',
    components: {

    },
    data: function() {
        return {
            showLoadingDb: false,
            lastActiveDbName: '',
            dbIntersectionObserver: null
        }
    },
    computed: mapState({
        state: state => state,
        loadingDb: state => state.loadingDb,
    }),
    watch: {
        async loadingDb(loadingDB) {
            dbLoadStartedTs = moment.now();
            if (loadingDB) {
                this.showLoadingDb = loadingDB;
            } else {
                const tookSec = moment.now() - dbLoadStartedTs;
                if (tookSec < loadingDbAnimationMs) {
                    let msDelay = loadingDbAnimationMs - tookSec;
                     // let animation finish
                    a.delay(msDelay).then(() => {
                        this.showLoadingDb = false;
                    });
                }
                

                this.$nextTick(() => {
                    this.scrollToActiveDB();
                    this.handleDbIntersectionObserver();
                });
            }
        },
    },
    methods: {

        // this method adds "sticky-active" class to element which is wrapper of db name. 
        // it's needed because I want to change style of that element when position:sticky activated 
        handleDbIntersectionObserver() {
            if (! this.dbIntersectionObserver) {
                this.dbIntersectionObserver = new IntersectionObserver((entries) => {
                    const dbLinkWrapper = entries[0].target.closest('li').querySelector('.db-link-wrapper');
                    if (entries[0].intersectionRatio === 0) {
                        dbLinkWrapper.classList.add('sticky-active');
                    } else {
                        dbLinkWrapper.classList.remove('sticky-active');
                    }
                }, { threshold: [0,1] });
            }
            
            if (this.lastActiveDbName) {
                const oldEl = this.$refs[`intersect-${this.lastActiveDbName}`][0];
                oldEl.closest('li').querySelector('.db-link-wrapper').classList.remove('sticky-active');
                this.dbIntersectionObserver.unobserve(oldEl);
            }
            this.dbIntersectionObserver.observe(this.$refs[`intersect-${this.$store.state.activeDb.name}`][0]);
        },
        scrollToActiveDB() {
            const activeDbTopEl = document.querySelector('.db-link.router-link-exact-active')
                .closest('li')
                .querySelector('.db-link-wrapper-top');

            if (activeDbTopEl) {
                if ('' === this.lastActiveDbName) {
                    activeDbTopEl.scrollIntoView({
                        block: 'start',
                        behavior: 'smooth'
                    });
                } else {
                    activeDbTopEl.scrollIntoView({
                        block: 'nearest'
                    });
                }
                this.lastActiveDbName = (this.$store.state.activeDb ? this.$store.state.activeDb.name: '');
            }
        },
        numberWithCommas: utils.numberWithCommas,
        onDbLinkClicked() {
            if (this.$route.name === 'database') {
                // if database already opened, lets update it
                eventBus.$emit('load-database', this.$route.params.dbName);
            }
        },

        onCollectionLinkMouseDown(collectionName) {
            eventBus.$emit('databaseNavigation:collection-mousedown', collectionName);
        }

    },
    mounted: async function() {
        await this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST)
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
            // border-bottom: 1px solid #ddd;
            
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
// .loading-animation.loading {
//   transition: background 0.4s ease-out;
//   background-size: 100%;
// }
.db-link.router-link-exact-active {
    font-weight: bold;
}
.no-docs {
    color: #888;
}

</style>






