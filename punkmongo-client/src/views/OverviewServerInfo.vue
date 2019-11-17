<template>
  <div>
    
    <table cellpadding="2" cellspacing="1">
      <col width="150" valign="top">
      <col width="500" valign="top">
      <tr><th colspan="2">General</th></tr>
      <tr>
        <td>MongoDB binary</td>
        <td>{{serverInfo.mem.bits}} Bits</td>
      </tr>
      <tr>
        <td>Command</td>
        <td>{{serverInfo.argv}}</td>
      </tr>
      <tr>
        <td>Bind IP</td>
        <td>{{serverInfo.bindIp}}</td>
      </tr>
      
      <tr>
        <td>Uptime</td>
        <td>{{formatUptime(serverInfo.uptime)}}</td>
      </tr>
      <tr>
        <td>Server Local Time</td>
        <td>{{Date(serverInfo.localTime).toString()}}</td>
      </tr>
      <tr>
        <td>Storage Engine</td>
        <td>{{serverInfo.storageEngine}}</td>
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
        <td>OS Type</td>
        <td>{{serverInfo.hostInfo.os.type}}</td>
      </tr>
      <tr>
        <td>OS Name</td>
        <td>{{serverInfo.hostInfo.os.name}}</td>
      </tr>
      <tr>
        <td>OS Version</td>
        <td>{{serverInfo.hostInfo.os.version}}</td>
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
</template>

<script>

import * as actions from '../store/actions'

export default {
  name: 'OverviewServerInfo',
  components: {
    
  },
  data: function() {
    const state = this.$store.state;
    return {
      serverInfo: state.persistent.serverInfo
    }
  },
  mounted: async function() {
    this.$store.dispatch(actions.ACTION_RELOAD_SERVER_INFO);
    
  },
  methods: {
    formatUptime (uptime) {
      if (uptime < 60) {
        return uptime + ' sec';
      } else if (uptime < 60 * 60) {
        return Math.floor(uptime / 60) + ' min';
      } else if (uptime < 60 * 60 * 24) {
        return Math.floor(uptime / 60 / 60) + ' hours';
      }

    }
  }
}
</script>




