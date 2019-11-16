


module.exports = async function (params, dbClient) {  
  const result = await dbClient.db('admin').admin().listDatabases();
  
  

  test.tttt;

  

  console.log('dbs:', result.databases);

  return result.databases;
}