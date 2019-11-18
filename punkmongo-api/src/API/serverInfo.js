const a = require('awaiting');

module.exports = async function (params, dbClient) {  
  const db = dbClient.db('admin');
  const admin = db.admin();

  const serverStatus = await admin.serverStatus();
  const getCmdLineOpts = await db.executeDbAdminCommand({getCmdLineOpts: 1});
  const hostInfo = await db.executeDbAdminCommand({hostInfo: 1});
  

  const results = {
    version: serverStatus.version,
    uptime: serverStatus.uptime,
    localTime: serverStatus.localTime,
    connections: {
      current: serverStatus.connections.current,
      available: serverStatus.connections.available,
      active: serverStatus.connections.active,
    },
    opcounters: {
      insert: serverStatus.opcounters.insert,
      query: serverStatus.opcounters.query,
      update: serverStatus.opcounters.update,
      delete: serverStatus.opcounters.delete,
      getmore: serverStatus.opcounters.getmore,
      command: serverStatus.opcounters.command,
    },
    opcountersRepl: {
      insert: serverStatus.opcountersRepl.insert,
      query: serverStatus.opcountersRepl.query,
      update: serverStatus.opcountersRepl.update,
      delete: serverStatus.opcountersRepl.delete,
      getmore: serverStatus.opcountersRepl.getmore,
      command: serverStatus.opcountersRepl.command,
    },
    storageEngine: serverStatus.storageEngine.name,
    mem: {
      bits: serverStatus.mem.bits,
      resident: serverStatus.mem.resident,
      virtual: serverStatus.mem.virtual,
    },
    argv: getCmdLineOpts.argv.join(' '),
    bindIp: getCmdLineOpts.parsed.net.bindIp,
    port: getCmdLineOpts.parsed.net.port,
    oplogSizeMB: getCmdLineOpts.parsed.replication.oplogSizeMB,
    replSet: getCmdLineOpts.parsed.replication.replSet,
    hostInfo: hostInfo
  };

  return results;
}


/*
serverStatus
  version
  uptime
  localTime
  connections
    current - connections now
    available - available
    active - how many connections running queries right now
  opcounters // database operations by type since the mongod instance last started.
    insert
    query
    update
    delete
    getmore
    command
  opcountersRepl
    insert
    query
    update
    delete
    getmore
    command
  storageEngine
    name // wiredTiger
  mem
    bits
    resident
    virtual

getCmdLineOpts
  argv
  parsed
    net
      bindIp
    replication
      oplogSizeMB
      replSet



*/










