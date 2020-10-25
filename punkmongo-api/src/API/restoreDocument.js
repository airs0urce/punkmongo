
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

module.exports = async function (params, dbClient) {  
    const restored = await UndoDelete.restore(params.restoreId);    
    return {restored: restored}
}