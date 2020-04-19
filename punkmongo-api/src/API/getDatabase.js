
const a = require('awaiting');

module.exports = async function (params, dbClient) {  
  const db = dbClient.db(params.db);
  
  const cursor = await db.listCollections({}, {nameOnly: true});
  let collection;
  let collections = [];
  while (collection = await cursor.next()) {
    collections.push(collection.name);
  }
  collections.sort();

  collections = collections.map((collection) => {  return {name: collection} })

  return {
    stats: await db.stats(),
    collections: collections,
  }
}