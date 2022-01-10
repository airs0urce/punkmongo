
const a = require('awaiting');
const ApiError = require('../errors/ApiError');

/*
params = {
    db: 'db_name',
    collection: 'collection_name',
}
*/

module.exports = async function (params, mongoClient) {  
    const collection = mongoClient.db(params.db).collection(params.collection);
    await collection.drop();
    
    return {}
}