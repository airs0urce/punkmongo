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
                    <router-link class="button new-collection no-select btn-icon" :to="'/db/' + $store.state.activeDb.name + '/new-collection'">
                        <font-awesome-icon icon="plus" /> 
                        New Collection
                    </router-link>
                </div>
                <div class="action-buttons-right">
                    <router-link class="button no-select btn-icon btn-red" :to="'/db/' + $store.state.activeDb.name + '/delete'">
                        <font-awesome-icon icon="trash-alt" /> 
                        Delete "{{activeDb.name}}" database…
                    </router-link>
                </div>
            </div> 

            <div class="gap"></div>
            
            <table cellpadding="2" cellspacing="1" class="full-width-table zebra">
                <colgroup>
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="5%" valign="top">
                </colgroup>
                <thead>
                    <tr>
                        <th>Collection</th>
                        <th>Documents</th>
                        <th>Data Size</th>
                        <th>Storage Size</th>
                        <th>Avg Doc Size</th>
                        <th>Indexes</th>
                        <th>Indexes Size</th>
                        <th rowspan="3">Custom Collation</th>
                        <th rowspan="3">Capped</th>
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
                        <td>
                            <router-link :to="'/db/' + activeDb.name + '/col/' + collection.name">{{collection.name}}</router-link>
                        </td>
                        <td>{{numberWithCommas(collection.stats.objects)}}</td>
                        <td>{{bytesFormatted(collection.stats.dataSize)}}</td>
                        <td>{{bytesFormatted(collection.stats.storageSize)}}</td>
                        <td>{{bytesFormatted(collection.stats.avgObjSize)}}</td>
                        <td>{{numberWithCommas(collection.stats.indexesCount)}}</td>
                        <td>{{bytesFormatted(collection.stats.indexesSize)}}</td>
                        <td class="text-center">
                            <span v-if="collection.options.collation">
                                <font-awesome-icon icon="circle" class="light" />
                            </span>
                        </td>
                        <td class="text-center">
                            <span v-if="collection.options.capped">
                                <font-awesome-icon icon="circle" class="light" />
                            </span>
                        </td>
                        <td class="td-rename">
                            <router-link class="no-select btn-icon" :to="{ name: 'rename-collection', params: { dbName: activeDb.name, collName: collection.name }}" >
                                <font-awesome-icon icon="pen" class="light" />
                            </router-link>
                        </td>
                        <td class="td-delete">
                            <router-link class="no-select btn-icon delete-icon" :to="{ name: 'delete-collection', params: { dbName: activeDb.name, collName: collection.name }}" >
                                <font-awesome-icon icon="trash-alt" /> 
                            </router-link>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th>Collection</th>
                        <th>Documents</th>
                        <th>Data Size</th>
                        <th>Storage Size</th>
                        <th>Avg Doc Size</th>
                        <th>Indexes</th>
                        <th>Indexes Size</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script>
  
import * as actions from '../store/actions'
import moment from 'moment';
import * as a from 'awaiting';
import eventBus from '../eventBus'
import {
    mapState
} from 'vuex';
import utils from '../utils'


export default {
    name: 'OverviewDatabases',
    components: {

    },
    computed: mapState({
        activeDb: state => state.activeDb,
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


<style lang="scss">

</style>





