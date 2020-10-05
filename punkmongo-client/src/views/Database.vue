<template>
    <div>
        <div v-if="activeDb.name == ''">Loading...</div>
        <div v-if="activeDb.name != ''">
            <h1 class="page-header no-select">
                <div v-if="activeDb.name != ''">
                    <router-link :to="`/overview/databases`">Databases</router-link>
                    <font-awesome-icon icon="angle-right" class="arrow-separator" />{{activeDb.name}}
                    <span class="light">({{activeDb.collections.length}})</span>
                </div>
            </h1>


            
            <router-link class="new-collection no-select" :to="'/db/' + $store.state.activeDb.name + '/new-collection'">New Collection</router-link>

            <div class="gap"></div>
            
            <table cellpadding="2" cellspacing="1" class="full-width-table">
                <colgroup>
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                    <col width="14%" valign="top">
                </colgroup>
                <thead>
                    <tr>
                        <th>Collections</th>
                        <th>Documents</th>
                        <th>Data Size</th>
                        <th>Storage Size</th>
                        <th>Avg Doc Size</th>
                        <th>Indexes</th>
                        <th>Indexes Size</th>
                    </tr>
                    <tr>
                        <th rowspan="2">TOTAL</th>
                        <th rowspan="2">{{ numberWithCommas(statsTotal('objects')) }}</th>
                        <th>{{ bytesFormatted(statsTotal('dataSize')) }}</th>
                        <th>{{ bytesFormatted(statsTotal('storageSize'), 'MB') }}</th>
                        <th>{{ bytesFormatted(statsTotal('avgObjSize'), 'KB') }}</th>
                        <th rowspan="2">{{ statsTotal('indexesCount') }}</th>
                        <th>{{ bytesFormatted(statsTotal('indexesSize'), 'MB') }}</th>
                    </tr>
                    <tr>
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
                    </tr>
                </tbody>
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








