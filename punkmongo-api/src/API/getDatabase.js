
const a = require('awaiting');

module.exports = async function (params, dbClient) {  
  const db = dbClient.db(params.db);
  
  const cursor = await db.listCollections({}, {nameOnly: true});
  let collection;
  const collections = [];
  while (collection = await cursor.next()) {
    collections.push(collection.name);
  }
  collections.sort();

  const dbStats = await db.stats();

  return {
    stats: dbStats,
    collections: collections
  }
}