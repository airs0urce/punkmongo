
const a = require('awaiting');

module.exports = async function (params, mongoClient) {  
    const db = mongoClient.db(params.db);

    const cursor = await db.listCollections({}, {});
    let collection;
    let collections = [];
    while (collection = await cursor.next()) {
        const indexes = await db.collection(collection.name).indexes();
        collections.push({
            name: collection.name,
            options: collection.options,
            indexes: indexes
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