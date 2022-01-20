
const a = require('awaiting')
    , ApiError = require('../errors/ApiError')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , mongoHelpers = require('../modules/mongoHelpers')
;

/*
params = {
    db: 'db_name',
    collection: 'collection_name',
    doc: , // mongo document in EJSON format
}
*/

module.exports = async function (params, mongoClient) {  
    const collection = mongoClient.db(params.db).collection(params.collection);

    let doc, result;

    try {
        doc = mongoHelpers.mongoShellToObject(params.doc);
    } catch (e) {
        throw new ApiError(`${e.message} at ${e.stack}`, 1);
    }

    try {
        result = await collection.insertOne(doc);
    } catch (e) {
        throw new ApiError(`Error inserting document: ${e.message}`, 2);
    }

    return {
        acknowledged: result.acknowledged,
        insertedId: result.insertedId,
    }
}