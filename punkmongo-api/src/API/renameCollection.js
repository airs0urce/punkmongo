
const a = require('awaiting');
const ApiError = require('../errors/ApiError');
const util = require('util');

/*
params = {
    db: 'db_name',
    collection: 'collection_name',
    newCollectionName: ''
}
*/

module.exports = async function (params, mongoClient) {  
    const collection = mongoClient.db(params.db).collection(params.collection);

    try {
        await collection.rename(params.newCollectionName);
    } catch (e) {
        throw new ApiError(e.message, 1, e.name);
    }
    return {}
}