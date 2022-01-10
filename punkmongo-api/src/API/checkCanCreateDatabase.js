
const a = require('awaiting');
const mongoHelpers = require('../modules/mongoHelpers');

// params.db
module.exports = async function (params, mongoClient) {  
    const result = await mongoHelpers.checkCanCreateDatabase(params.db);
    return result;
}