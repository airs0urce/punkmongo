
const a = require('awaiting');

module.exports = async function (params, dbClient) {  
    const db = dbClient.db(params.db);

    const cursor = await db.listCollections({}, {});
    let collection;
    let collections = [];
    while (collection = await cursor.next()) {
        collections.push({
            name: collection.name,
            options: collection.options
        });
    }
    collections.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return {
        stats: await db.stats(),
        collections: collections,
    }
}