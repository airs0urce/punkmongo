
const a = require('awaiting')
    , ApiError = require('../errors/ApiError')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , UndoDelete = require('../modules/UndoDelete')
;

/*
params = {
    db: 'db_name',
    collection: 'collection_name',
    _id: '5f7ccd180e95b70d27a9b623',
}
*/

module.exports = async function (params, dbClient) {  
    dbClient.db('local').collection('punkmongo_undo');

    const restoreId = await UndoDelete.backup(params.db, params.collection, params._id);

    const collection = dbClient.db(params.db).collection(params.collection);
    await collection.deleteOne({ _id: ObjectID(params._id) });


    
    return {restoreId: restoreId}
}