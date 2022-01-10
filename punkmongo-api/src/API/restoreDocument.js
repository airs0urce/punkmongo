
const a = require('awaiting')
    , ApiError = require('../errors/ApiError')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , UndoDelete = require('../modules/UndoDelete')
;

/*
params = {
    restoreId: '5f90722d3f3b7906ba85c0fd'
}
*/

module.exports = async function (params, mongoClient) {  
    const restored = await UndoDelete.restore(params.restoreId);
    
    if (! restored) {
        throw new ApiError(`Backup record for this document has expired and deleted`, 1);
    }
}