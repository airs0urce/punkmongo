
const a = require('awaiting');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const { EJSON } = require('bson');

module.exports = async function (params, mongoClient) {  
    const db = mongoClient.db(params.db);

    // get full collections list
    const cursor = await db.listCollections({}, {nameOnly: true});
    let collection;
    const collections = [];
    while (collection = await cursor.next()) {
        collections.push(collection.name);
    }
    collections.sort();


    // get stats for the collections
    let collectionsStats = await Promise.all(collections.map((colName) => {
        return db.collection(colName).stats();
    }));

    const response = {};
    for (let i = 0; i < collections.length; i++) {
        const colName = collections[i];
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


