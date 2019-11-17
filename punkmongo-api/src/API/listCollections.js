
module.exports = async function (params, dbClient) {  
  const cursor = await dbClient.db(params.db).listCollections({}, {nameOnly: true});
  let record;
  const collections = [];
  while (record = await cursor.next()) {
    collections.push(record.name);
  }

  collections.sort();

  return collections;
}