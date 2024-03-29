
const a = require('awaiting');
const mongoHelpers = require('../modules/mongoHelpers');

// params.db
// params.collection
module.exports = async function (params, mongoClient) {  
    const result = await mongoHelpers.checkCanCreateCollection(params.db, params.collection);
    return result;
}