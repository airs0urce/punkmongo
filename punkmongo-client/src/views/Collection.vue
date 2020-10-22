<template>
    <div>
        <h1 class="page-header no-select">
            <div v-show="activeDb.name != ''">
                <router-link :to="`/overview/databases`">Databases</router-link>
                <font-awesome-icon icon="angle-right" class="arrow-separator" /> 
                <router-link :to="`/db/${activeDb.name}`">{{activeDb.name}}</router-link>
                <font-awesome-icon icon="angle-right" class="arrow-separator" />{{activeDb.activeCollection.name}} 
                <span class="light" v-if="getCollectionStats().objects > 0">({{numberWithCommas(getCollectionStats().objects)}})</span>
                <span class="collection-tags">
                    <div class="info-tag disabled" v-if="!dbCollectionOptions.capped">not capped</div>
                    <div class="info-tag info" v-if="dbCollectionOptions.capped" >
                        capped
                        <span v-if="collOptionExists('max') && collOptionExists('size')">(maximum <strong>{{dbCollectionOptions.max}}</strong> documents or <strong>{{bytesFormatted(dbCollectionOptions.size, 'MB', 0, false)}})</strong></span>
                        <span v-if="collOptionExists('max') && !collOptionExists('size')">(<strong>{{dbCollectionOptions.max}}</strong> documents maximum)</span>
                        <span v-if="!collOptionExists('max') && collOptionExists('size')">(<strong>{{bytesFormatted(dbCollectionOptions.size, 'MB', 0, false)}}</strong> maximum)</span>
                    </div>

                    <div class="info-tag disabled" v-show="!dbCollectionOptions.collation">default collation</div>
                    <div class="info-tag info" v-show="dbCollectionOptions.collation" @mouseenter="showCollationDetails(true)" @mouseleave="showCollationDetails(false)">
                        custom collation…
                        <div class="info-tag-details" ref="infoTagDetails">
                            <div class="custom-collation-title">
                                Custom Collation<a href="https://docs.mongodb.com/master/reference/collation/" target="_blank">
                                    <font-awesome-icon icon="question-circle" class="icon-help" /> 
                                </a>
                            </div>


                            <table>
                                <colgroup>
                                    <col width="20%" valign="top">
                                    <col width="17%" valign="top">
                                    <col width="63%" valign="top">
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>option</th>
                                        <th>value</th>
                                        <th>value description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item of getCollationInfo()" :class="{'default': item.default, 'non-default': !item.default}">
                                        <td>{{item.title}}</td>
                                        <td>
                                            {{JSON.stringify(item.value)}}
                                        </td>
                                        <td>
                                            {{item.valueInfo}}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            

                        </div>
                    </div>
                </span>
            </div>
        </h1>

        <ul class="tabs no-select">
            <router-link :to="{name: 'collection-manager-query'}">Query/Update/Delete/Distinct</router-link>
            <router-link :to="{name: 'collection-manager-insert'}">Insert</router-link>
            <router-link :to="{name: 'collection-manager-aggregate'}">Aggregate</router-link>
            <router-link :to="{name: 'collection-manager-indexes'}">Indexes</router-link>
        </ul>
        
        <CollectionQuery v-if="$route.name == 'collection-manager-query'"/>
        <CollectionInsert v-if="$route.name == 'collection-manager-insert'"/>
        <CollectionAggregate v-if="$route.name == 'collection-manager-aggregate'"/>
        <CollectionIndexes v-if="$route.name == 'collection-manager-indexes'" />    


    </div>
</template>

<script>
import * as a from 'awaiting';
import CollectionQuery from '@/components/CollectionQuery';
import CollectionInsert from '@/components/CollectionInsert';
import CollectionAggregate from '@/components/CollectionAggregate';
import CollectionIndexes from '@/components/CollectionIndexes';
import CollectionValidation from '@/components/CollectionValidation';
import utils from '../utils'
import collectionOptions from '../collectionOptions'
import { gsap } from 'gsap'

import {
    mapState
} from 'vuex';
import eventBus from '../eventBus'
import * as mutations from '../store/mutations'

export default {
    components: {
        CollectionQuery, CollectionInsert, 
        CollectionAggregate, CollectionIndexes, 
        CollectionValidation
    },
    data: function() {
        return {
            selectedTab: 'query',
            customCollationAnim: null
        }
    },
    computed: mapState({
        activeDb: state => state.activeDb,
        dbCollectionOptions: (state) => {
            const collection = state.activeDb.collections.find((collection) => {
                return collection.name == state.activeDb.activeCollection.name;
            });

            if (collection && collection.options) {
                return collection.options;
            }
            return {};
        }
    }),
    methods: {
        setActiveCollection() {
            const collName = this.$route.params.collName;
            this.$store.commit(mutations.SET_ACTIVE_COLLECTION, collName);
        },
        numberWithCommas: utils.numberWithCommas,
        bytesFormatted: utils.bytesFormatted,
        getCollectionStats() {
            const collection = this.activeDb.collections.find((coll) => {
                return coll.name == this.activeDb.activeCollection.name;
            });
            if (!collection) {
                return {};
            }
            return collection.stats;
        },
        collOptionExists(key) {
            return (typeof this.dbCollectionOptions[key] != 'undefined' && this.dbCollectionOptions[key] != 0);
        },
        getCollationInfo() {
            const valueByField = this.dbCollectionOptions.collation;
            if (! valueByField) {
                return [];
            }

            const collationInfoArr = [];
            for (let field in collectionOptions) {
                const collectionOption = collectionOptions[field].values.find((valueItem) => {
                    return (valueItem.value == valueByField[field]); 
                })
                const valueText = collectionOption.text;

                collationInfoArr.push({
                    title: collectionOptions[field].title,
                    value: valueByField[field],
                    default: (valueByField[field] === collectionOptions[field].default),
                    valueInfo: valueText
                });
            }

            return collationInfoArr;
        },
        showCollationDetails(bool) {
            if (bool) {
                this.customCollationAnim.play();
            } else {
                this.customCollationAnim.reverse();
            }
        }
    },
    mounted() {
        if (this.$route.params.dbName !== this.$store.state.activeDb.name) {
            eventBus.$emit('load-database', this.$route.params.dbName);
        }

        this.customCollationAnim = gsap.fromTo(this.$refs.infoTagDetails, 
            {
                y: 5, 
                opacity: 0,
            }, 
            {
                display: 'block',
                paused: true,
                y: 0, 
                opacity: 1, 
                duration: 0.3,
                onReverseComplete: () => {
                    gsap.set(this.$refs.infoTagDetails, {display: 'none'});
                }
            }
        )
        
        this.setActiveCollection();
    },
    destroyed() {
        this.customCollationAnim.kill()
    },
    watch: {
        async $route(to) {
            if (to.name.startsWith('collection-manager-')) {
                this.setActiveCollection();
            }
        }
    },
}
</script>

<style lang="scss" scoped>

.tabs {
    list-style: none;
    display: flex;
    padding-left: 0;
    border-bottom: 1px solid #e2e2e2;

    a {
        background-color: #eeefff;
        padding: 5px 10px;
        cursor: pointer;
        user-select: none;
        border: 1px solid transparent;
        border-radius: 3px 3px 0 0;
        position: relative;
        bottom: -1px;
        border-bottom-color: #e2e2e2;
        background-color: white;

        &.router-link-exact-active {
            border-color: #e2e2e2;
            border-bottom-color: transparent;
            background-color: #eeefff;
        }
    }
}

.collection-tags {
    margin-left: 1rem;
    .info-tag {
        margin-right: 0.5em;
        position: relative;
        .info-tag-details {
            display: none;
            border-radius: 3px;
            position: absolute;
            z-index: 2;
            background-color: #eee;
            color: #000;
            border: 1px solid #ddd;
            padding: 1em;
            top: 1.7rem;
            right: -10rem;
            width: 55rem;
            .custom-collation-title {
                font-weight: bold;
                margin-bottom: 0.5em;
            }
            .non-default td {
                background-color: #fffaa3;
            }
        }
    }
}
</style>








