<template>
    <div>
        <div v-if="!serverInfo.version">
            Loading...
        </div>
        <div v-if="serverInfo.version">
            <h1 class="page-header no-select">
                Server Information
            </h1>

            <table cellpadding="2" cellspacing="1" class="zebra">
                <colgroup>
                    <col width="150">
                    <col width="500">
                </colgroup>
                <thead>
                    <tr>
                        <th colspan="2">MongoDB</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Command</td>
                        <td>{{serverInfo.argv}}</td>
                    </tr>
                    <tr>
                        <td>Mongo Version</td>
                        <td>{{serverInfo.version}}</td>
                    </tr>
                    <tr>
                        <td>Binary</td>
                        <td>{{serverInfo.mem.bits}} Bits</td>
                    </tr>
                    <tr>
                        <td>Uptime</td>
                        <td>{{formatUptime(serverInfo.uptime)}}</td>
                    </tr>
                    <tr>
                        <td>Storage Engine</td>
                        <td>{{serverInfo.storageEngine}}</td>
                    </tr>
                    <tr>
                        <td>Bind IP</td>
                        <td>{{serverInfo.bindIp}}</td>
                    </tr>
                </tbody>
            </table>
            <div class="gap"></div>
            <table cellpadding="2" cellspacing="1" class="zebra">
                <colgroup>
                    <col width="150">
                    <col width="500">
                </colgroup>
                <thead>
                    <tr>
                        <th colspan="2">Host info</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Hostname</td>
                        <td>{{serverInfo.hostInfo.system.hostname}}</td>
                    </tr>
                    <tr>
                        <td>Memory Limit</td>
                        <td>{{serverInfo.hostInfo.system.memLimitMB}} MB</td>
                    </tr>
                    <tr>
                        <td>CPU Cores</td>
                        <td>{{serverInfo.hostInfo.system.numCores}}</td>
                    </tr>
                    <tr>
                        <td>CPU Arch</td>
                        <td>{{serverInfo.hostInfo.system.cpuArch}}</td>
                    </tr>
                    <tr>
                        <td>OS</td>
                        <td>{{serverInfo.hostInfo.os.type}} {{serverInfo.hostInfo.os.name}} {{serverInfo.hostInfo.os.version}}</td>
                    </tr>
                    <tr>
                        <td>Server Local Time</td>
                        <td>{{Date(serverInfo.localTime).toString()}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { useMainStore } from '../stores/main'
import { computed } from 'vue'

export default {
    name: 'OverviewServerInfo',
    setup() {
        const store = useMainStore()
        const serverInfo = computed(() => store.persistent.serverInfo)
        return { store, serverInfo }
    },
    created() {
        this.store.reloadServerInfo()
    },
    methods: {
        formatUptime(uptime) {
            if (uptime < 60) {
                return uptime + ' sec'
            } else if (uptime < 60 * 60) {
                return Math.floor(uptime / 60) + ' min'
            } else if (uptime < 60 * 60 * 24) {
                return Math.floor(uptime / 60 / 60) + ' hours'
            } else {
                return Math.floor(uptime / 60 / 60 / 24) + ' day(s)'
            }
        }
    }
}
</script>
