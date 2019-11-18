
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

  const collectionsRecords = await Promise.all(collections.map((coll) => {
    return db.collection(coll).count();
  }));


  const collectionsResult = [];

  for (let i = 0; i < collections.length; i++) {
    collectionsResult.push({
      name: collections[i],  
      count: collectionsRecords[i]
    });
  }

  return {
    stats: await db.stats(),
    collections: collectionsResult,
  }
}