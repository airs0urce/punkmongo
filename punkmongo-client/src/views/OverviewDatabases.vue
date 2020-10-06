<template>
    <div>
        <div v-if="dbList.length == 0">
            Loading...
        </div>
        <div v-if="dbList.length > 0">

            <h1 class="page-header no-select">
                Databases                
            </h1>

            <table cellpadding="2" cellspacing="1" class="full-width-table">
                <colgroup>
                    <col width="200" valign="top">
                    <col width="110" valign="top">
                    <col width="90" valign="top">
                    <col width="110" valign="top">
                    <col width="110" valign="top">
                    <col width="90" valign="top">
                </colgroup>
                <thead>
                    <tr>
                        <th>Database name</th>
                        <th>Collections</th>
                        <th>Views</th>
                        <th>Storage Size</th>
                        <th>Indexes</th>
                        <th>Indexes Size</th>
                        <th>Documents</th>
                    </tr>
                    <tr>
                        <th rowspan="2">TOTAL</th>
                        <th rowspan="2">{{ numberWithCommas(statsTotal('collections')) }}</th>
                        <th rowspan="2">{{ numberWithCommas(statsTotal('views')) }}</th>
                        <th>{{ bytesFormatted(statsTotal('storageSize')) }}</th>
                        <th rowspan="2">{{ numberWithCommas(statsTotal('indexes')) }}</th>
                        <th>{{ bytesFormatted(statsTotal('indexSize')) }}</th>
                        <th rowspan="2">{{ numberWithCommas(statsTotal('objects')) }}</th>
                    </tr>
                    <tr>
                        <th>{{ bytesFormatted(statsTotal('storageSize'), 'GB') }}</th>
                        <th>{{ bytesFormatted(statsTotal('indexSize'), 'GB') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="db in dbList">
                        <td>
                            <!-- {{db.name}} -->
                            <router-link :to="'/db/' + db.name" >{{db.name}}</router-link>
                        </td>
                        <td>{{db.stats.collections}}</td>
                        <td>{{db.stats.views}}</td>
                        <td>{{bytesFormatted(db.stats.storageSize)}}</td>
                        <td>{{db.stats.indexes}}</td>
                        <td>{{bytesFormatted(db.stats.indexSize)}}</td>
                        <td>{{numberWithCommas(db.stats.objects)}}</td>
                    </tr>
                </tbody>
                <tfoot>
              
                    <tr>
                        <th>Database name</th>
                        <th>Collections</th>
                        <th>Views</th>
                        <th>Indexes</th>
                        <th>Storage Size</th>
                        <th>Indexes Size</th>
                        <th>Documents</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script>

import * as actions from '../store/actions'
import utils from '../utils'
import {
    mapState
} from 'vuex';

export default {
    name: 'OverviewDatabases',
    components: {

    },
    computed: mapState({
        dbList: state => state.persistent.dbList,
    }),
    created: async function() {
        this.$store.dispatch(actions.ACTION_RELOAD_DB_LIST);
    },
    methods: {
        statsTotal(field) {
            let total = 0;
            const dbList = this.$store.state.persistent.dbList;
            for (let db of dbList) {
                total += db.stats[field];
            }
            return total;
        },
        bytesFormatted: utils.bytesFormatted,
        numberWithCommas: utils.numberWithCommas,
    },
}
</script>





