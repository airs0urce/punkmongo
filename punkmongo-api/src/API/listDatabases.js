

module.exports = async function (params, dbClient) {  
  const result = await dbClient.db('admin').admin().listDatabases();
  

  // await new Promise((resolve) => {
  //   setTimeout(() => { resolve() }, 5000);
  // });
  let i;

  const getStatsPromises = [];
  for (i = 0; i < result.databases.length; i++) {
    getStatsPromises.push(dbClient.db(result.databases[i].name).stats())
  }

  const getStatsResults = await Promise.all(getStatsPromises);

  for (i = 0; i < result.databases.length; i++) {
    result.databases[i].stats = getStatsResults[i];
  }

  return result.databases;
}