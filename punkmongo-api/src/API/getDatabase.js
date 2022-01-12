
const a = require('awaiting');

module.exports = async function (params, mongoClient) {  
    const db = mongoClient.db(params.db);

    const cursor = await db.listCollections({}, {});
    let collection;
    let collections = [];
    while (collection = await cursor.next()) {
        const coll = {
            name: collection.name,
            options: collection.options,
            indexes: []
        }

        switch (collection.type) {
            case 'collection': {
                const indexes = await db.collection(collection.name).indexes();
                coll.indexes = indexes;
                break;
            }
            case 'view': {
                break;
            }
        }

        collections.push(coll);
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