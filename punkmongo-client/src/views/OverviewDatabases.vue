<template>
    <div>
        <div v-if="dbList.length == 0">
            Loading...
        </div>
        <table v-if="dbList.length > 0" cellpadding="2" cellspacing="1" class="full-width-table">
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
                    <th>Indexes</th>
                    <th>Storage Size</th>
                    <th>Indexes Size</th>
                    <th>Documents</th>
                </tr>
                <tr class="bold">
                    <td>TATAL</td>
                    <td>{{ numberWithCommas(statsTotal('collections')) }}</td>
                    <td>{{ numberWithCommas(statsTotal('views')) }}</td>
                    <td>{{ numberWithCommas(statsTotal('indexes')) }}</td>
                    <td>{{ bytesFormatted(statsTotal('storageSize')) }}</td>
                    <td>{{ bytesFormatted(statsTotal('indexSize')) }}</td>
                    <td>{{ numberWithCommas(statsTotal('objects')) }}</td>
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
                    <td>{{db.stats.indexes}}</td>
                    <td>{{bytesFormatted(db.stats.storageSize)}}</td>
                    <td>{{bytesFormatted(db.stats.indexSize)}}</td>
                    <td>{{numberWithCommas(db.stats.objects)}}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>TATAL</td>
                    <td>{{ statsTotal('collections') }}</td>
                    <td>{{ statsTotal('views') }}</td>
                    <td>{{ statsTotal('indexes') }}</td>
                    <td>{{ bytesFormatted(statsTotal('storageSize')) }}</td>
                    <td>{{ bytesFormatted(statsTotal('indexSize')) }}</td>
                    <td>{{ numberWithCommas(statsTotal('objects')) }}</td>
                </tr>
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





