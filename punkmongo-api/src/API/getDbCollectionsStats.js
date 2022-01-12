
const a = require('awaiting');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const { EJSON } = require('bson');

module.exports = async function (params, mongoClient) {  
    const db = mongoClient.db(params.db);

    // get full collections list
    const cursor = await db.listCollections({});
    let collection;
    const collections = [];
    while (collection = await cursor.next()) {
        collections.push({
            name: collection.name,
            type: collection.type
        });
    }
    collections.sort((a, b) => (a.name > b.name) ? 1 : -1);


    // get stats for the collections
    let collectionsStats = await Promise.all(collections.map((colItem) => {
        if (colItem.type === 'collection') {
            return db.collection(colItem.name).stats();
        } else {
            return {};
        }
    }));

    const response = {};
    for (let i = 0; i < collections.length; i++) {
        const colName = collections[i].name;
        const stats = collectionsStats[i];
        response[colName] = {
            objects: stats.count,
            dataSize: stats.size,
            storageSize: stats.storageSize,  
            avgObjSize: stats.avgObjSize  || 0,
            indexesCount: stats.nindexes,  
            indexesSize: stats.totalIndexSize,
        };
    }

    return response;
}


