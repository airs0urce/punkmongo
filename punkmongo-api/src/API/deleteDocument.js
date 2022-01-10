
const a = require('awaiting')
    , ApiError = require('../errors/ApiError')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , UndoDelete = require('../modules/UndoDelete')
    , mongoHelpers = require('../modules/mongoHelpers')
;

/*
params = {
    db: 'db_name',
    collection: 'collection_name',
    _id: '5f7ccd180e95b70d27a9b623',
}
*/

module.exports = async function (params, mongoClient) {  
    mongoClient.db('local').collection('punkmongo_undo');

    const docId = mongoHelpers.parse(params._id);

    const restoreId = await UndoDelete.backup(params.db, params.collection, docId);
    if (null === restoreId) {
        throw new ApiError(`Record with ID "${docId}" doesn't exist in "${params.collection}" collection anymore`, 1);
    }

    const collection = mongoClient.db(params.db).collection(params.collection);

    await collection.deleteOne({ _id: docId });


    return {restoreId: restoreId}
}