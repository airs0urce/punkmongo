
const a = require('awaiting')
    , ApiError = require('../errors/ApiError')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , UndoDelete = require('../modules/UndoDelete')
;

/*
params = {
    list: [
        {restoreId: '5f90722d3f3b7906ba85c0fd', expireAfterSec: 5},
        {restoreId: '5f90722d3f3b7906ba85c0ac', expireAfterSec: 10}
    ],
}
*/

module.exports = async function (params, dbClient) {  
    const promises = [];
    for (let item of params.list) {
        promises.push(UndoDelete.updateExpiration(item.restoreId, item.expireAfterSec));
    }
    await Promise.all(promises);

    return {}
}