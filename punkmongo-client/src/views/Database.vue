<template>
    <div>
        <div v-if="activeDb.name == ''">Loading...</div>
        <div v-if="activeDb.name != ''">
            <h1 class="page-header no-select">
                <div v-if="activeDb.name != ''">
                    <router-link :to="`/overview/databases`">Databases</router-link>
                    <font-awesome-icon icon="angle-right" class="arrow-separator" />{{activeDb.name}}
                    <span class="lighter">({{activeDb.collections.length}})</span>
                </div>
            </h1>

            <div class="action-buttons">
                <div class="action-buttons-left">
                    <router-link class="button new-collection no-select btn-icon" :to="'/db/' + encodeURIComponent($store.state.activeDb.name) + '/new-collection'">
                        <font-awesome-icon icon="plus" /> 
                        New Collection
                    </router-link>
                </div>
                <div class="action-buttons-right">
                    <router-link class="button no-select btn-icon btn-red" :to="'/db/' + encodeURIComponent($store.state.activeDb.name) + '/delete'">
                        <font-awesome-icon icon="trash-alt" /> 
                        Delete "{{activeDb.name}}" database…
                    </router-link>
                </div>
            </div> 

            <div class="gap"></div>
            
            <table cellpadding="2" cellspacing="1" class="full-width-table zebra dbs-table">
                <colgroup>
                    <col width="20%" valign="top">
                    <col width="8%" valign="top">
                    <col width="8%" valign="top">
                    <col width="8%" valign="top">
                    <col width="8%" valign="top">
                    <col width="8%" valign="top">
                    <col width="8%" valign="top">
                    
                    <col width="25%" valign="top">
                    <col width="3%" valign="top">
                    <col width="3%" valign="top">
                </colgroup>
                <thead>
                    <tr>
                        <th>Collection</th>
                        <th>Docs</th>
                        <th>Data Size</th>
                        <th>Storage Size</th>
                        <th>Avg Doc Size</th>
                        <th>Indexes</th>
                        <th>Indexes Size</th>
                        <th rowspan="3">Additional information</th>
                        <th rowspan="3">Rename</th>
                        <th rowspan="3">Del</th>
                    </tr>
                    <tr class="totals">
                        <th rowspan="2">TOTALS <font-awesome-icon class="lighter" icon="long-arrow-alt-right" /></th>
                        <th rowspan="2">{{ numberWithCommas(statsTotal('objects')) }}</th>
                        <th>{{ bytesFormatted(statsTotal('dataSize')) }}</th>
                        <th>{{ bytesFormatted(statsTotal('storageSize'), 'MB') }}</th>
                        <th>{{ bytesFormatted(statsTotal('avgObjSize'), 'KB') }}</th>
                        <th rowspan="2">{{ statsTotal('indexesCount') }}</th>
                        <th>{{ bytesFormatted(statsTotal('indexesSize'), 'MB') }}</th>
                    </tr>
                    <tr class="totals">
                        <th>{{ bytesFormatted(statsTotal('dataSize'), 'GB') }}</th>
                        <th>{{ bytesFormatted(statsTotal('storageSize'), 'GB') }}</th>
                        <th>{{ bytesFormatted(statsTotal('avgObjSize'), 'MB') }}</th>
                        <th>{{ bytesFormatted(statsTotal('indexesSize'), 'GB') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="collection in activeDb.collections">
                        <td class="nowrap">
                            <router-link :to="'/db/' + encodeURIComponent(activeDb.name) + '/col/' + encodeURIComponent(collection.name)">{{collection.name}}</router-link>
                        </td>
                        <td class="nowrap">{{numberWithCommas(collection.stats.objects)}}</td>
                        <td class="nowrap">{{bytesFormatted(collection.stats.dataSize)}}</td>
                        <td class="nowrap">{{bytesFormatted(collection.stats.storageSize)}}</td>
                        <td class="nowrap">{{bytesFormatted(collection.stats.avgObjSize)}}</td>
                        <td class="nowrap">{{numberWithCommas(collection.stats.indexesCount)}}</td>
                        <td class="nowrap">{{bytesFormatted(collection.stats.indexesSize)}}</td>
                        <td class="nowrap center minimal-padding">
                            <TagCapped class="first" :collectionOptions="collection.options" 
                                :showInfoInline="false" 
                                :fixedWidth="true" 
                                :detailsOnLeft="true"
                            />
                            <TagCollation :collectionOptions="collection.options" 
                                :hideDetailsAnimation="false" 
                                :hideDetailsDelay="100" 
                                :fixedWidth="true" 
                                :detailsOnLeft="true"
                            />
                            <TagTtl :ttlIndexes="ttlIndexes[collection.name]"
                                :hideDetailsAnimation="false" 
                                :hideDetailsDelay="100" 
                                :fixedWidth="true" 
                                :detailsOnLeft="true"
                            />
                        </td>
                        <td class="td-rename" title="rename collection">
                            <router-link class="no-select btn-icon" :to="{ name: 'rename-collection', params: { dbName: activeDb.name, collName: collection.name }}" >
                                <font-awesome-icon icon="pen" class="light" />
                            </router-link>
                        </td>
                        <td class="td-delete" title="delete collection">
                            <router-link class="no-select btn-icon delete-icon" :to="{ name: 'delete-collection', params: { dbName: activeDb.name, collName: collection.name }}" >
                                <font-awesome-icon icon="trash-alt" /> 
                            </router-link>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th>Collection</th>
                        <th>Docs</th>
                        <th>Data Size</th>
                        <th>Storage Size</th>
                        <th>Avg Doc Size</th>
                        <th>Indexes</th>
                        <th>Indexes Size</th>
                        <th>Options</th>
                        <th>Rename</th>
                        <th>Del</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script>
  
import * as actions from '../store/actions'
import moment from 'moment'
import * as a from 'awaiting'
import eventBus from '../eventBus'
import {
    mapState
} from 'vuex';
import utils from '../utils'
import TagCapped from '@/components/TagCapped'
import TagCollation from '@/components/TagCollation'
import TagTtl from '@/components/TagTtl'


export default {
    name: 'OverviewDatabases',
    components: {
        TagCapped, TagCollation, TagTtl
    },
    computed: mapState({
        activeDb: state => state.activeDb,
        ttlIndexes() {
            const ttlIndexes = {};
            for (let collection of this.activeDb.collections) {
                ttlIndexes[collection.name] = collection.indexes.filter((index) => {
                    return undefined !== index.expireAfterSeconds;
                });
            }
            return ttlIndexes;
        }
    }),
    watch: {
        async $route(to) {
            if ('database' == to.name) {
                eventBus.$emit('load-database', this.$route.params.dbName);
            }
        }
    },
    methods: {
        bytesFormatted: utils.bytesFormatted,
        numberWithCommas: utils.numberWithCommas,
        statsTotal(field) {
            let total = 0;
            const dbList = this.$store.state.persistent.dbList;
            for (let collection of this.activeDb.collections) {
                total += collection.stats[field];
            }
            if (isNaN(total)) {
                return 0;
            }
            return total;
        },
    },
    mounted() {
        eventBus.$emit('load-database', this.$route.params.dbName);
    }
}
</script>


<style lang="scss" scoped>
.dbs-table {
    margin-bottom: 18rem;  /* to make sure that popup from TagCollation always fits the screen and page doesn't jump */
    td.center {
        text-align: center;
    }
}

.minimal-padding {
    padding: 0;
}
.info-tag.first {
    margin-left: 0.5em;
}

</style>





