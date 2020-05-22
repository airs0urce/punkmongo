<template>
    <div>
    <div v-if="activeDb.name == ''">
        Loading...
    </div>
    <div v-if="activeDb.name != ''">
    Databases » {{activeDb.name}}
    <div class="line" />
        Statistics | New Collection | Command | 
        <div class="line" />
            <table cellpadding="2" cellspacing="1" width="480px">
                <colgroup>
                    <col width="25%" valign="top">
                    <col width="25%" valign="top">
                    <col width="25%" valign="top">
                    <col width="25%" valign="top">
                </colgroup>
                <thead>
                    <tr>
                        <th>Database Statistics</th>
                        <th>MB</th>
                        <th>GB</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Data Size</td>
                        <td>{{ bytesFormatted(activeDb.stats.dataSize, 'MB') }}</td>
                        <td>{{ bytesFormatted(activeDb.stats.dataSize, 'GB') }}</td>
                    </tr>
                    <tr>
                        <td>Storage Size</td>
                        <td>{{ bytesFormatted(activeDb.stats.storageSize, 'MB') }}</td>
                        <td>{{ bytesFormatted(activeDb.stats.storageSize, 'GB') }}</td>
                    </tr>
                    <tr>
                        <td>Index Size</td>
                        <td>{{ bytesFormatted(activeDb.stats.indexSize, 'MB') }}</td>
                        <td>{{ bytesFormatted(activeDb.stats.indexSize, 'GB') }}</td>
                    </tr>
                    <tr>
                        <td>Avg Object Size</td>
                        <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'MB') }}</td>
                        <td>{{ bytesFormatted(activeDb.stats.avgObjSize, 'GB') }}</td>
                    </tr>
                    <tr>
                        <td>Collections</td>
                        <td colspan="2">{{activeDb.collections.length}}</td>
                    </tr>
                    <tr>
                        <td>Documents</td>
                        <td colspan="2">{{ numberWithCommas(activeDb.stats.objects) }}</td>
                    </tr>
                    <tr>
                        <td>Indexes</td>
                        <td colspan="2">{{ activeDb.stats.indexes }}</td>
                    </tr>
                </tbody>
            </table>
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
                        <th>Collections ({{activeDb.collections.length}})</th>
                        <th>Documents</th>
                        <th>Data Size</th>
                        <th>Storage Size</th>
                        <th>Avg Doc Size</th>
                        <th>Indexes</th>
                        <th>Indexes Size</th>
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
    },
    mounted() {
        eventBus.$emit('load-database', this.$route.params.dbName);
    }
}
</script>








