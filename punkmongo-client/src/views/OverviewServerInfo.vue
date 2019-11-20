<template>
  <div>
    <div v-if="!serverInfo.version">
      Loading...
    </div>
    <div v-if="serverInfo.version">
      
      <table cellpadding="2" cellspacing="1">
        <col width="150" valign="top">
        <col width="500" valign="top">
        <tr><th colspan="2">General</th></tr>
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
      </table>

      <div class="gap"></div>

      <table cellpadding="2" cellspacing="1">
        <col width="150" valign="top">
        <col width="500" valign="top">
        <tr><th colspan="2">Host info</th></tr>
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
        
        
        
      </table>

      <!-- <table cellpadding="2" cellspacing="1">
        <col width="150" valign="top">
        <col width="500" valign="top">
        <tr><th colspan="2">Bind to</th></tr>
        <tr>
          <td>IP</td>
          <td>{{serverInfo.bindIp}}</td>
        </tr>
        <tr>
          <td>Port</td>
          <td>{{serverInfo.port}}</td>
        </tr>
      </table> -->

      

      <!-- <table cellpadding="2" cellspacing="1">
        <col width="150" valign="top">
        <col width="450" valign="top">
        <tr><th colspan="2">Web Server</th></tr>
        <tr>
          <td>Web server</td>
          <td>nginx/1.17.5</td>
        </tr>
        <tr>
          <td><a href="http://www.php.net" target="_blank">PHP version</a></td>
          <td>PHP 7.3.11</td>
        </tr>
        <tr>
          <td><a href="http://www.php.net/mongo" target="_blank">PHP extension</a></td>
          <td><a href="http://pecl.php.net/package/mongo" target="_blank">mongo</a>/1.6.12</td>
        </tr>
      </table> -->

    </div>
  </div>
</template>

<script>

import * as actions from '../store/actions'
import { mapState } from 'vuex';

export default {
  name: 'OverviewServerInfo',
  components: {
    
  },
  computed: mapState({
    serverInfo: state => state.persistent.serverInfo
  }),
  created: async function() {
    await this.$store.dispatch(actions.ACTION_RELOAD_SERVER_INFO);
  },
  methods: {
    formatUptime (uptime) {
      if (uptime < 60) {
        return uptime + ' sec';
      } else if (uptime < 60 * 60) {
        return Math.floor(uptime / 60) + ' min';
      } else if (uptime < 60 * 60 * 24) {
        return Math.floor(uptime / 60 / 60) + ' hours';
      } else {
        return Math.floor(uptime / 60 / 60 / 24) + ' day(s)';
      }

    }
  }
}
</script>




